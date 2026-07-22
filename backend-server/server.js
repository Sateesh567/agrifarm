// ============================================================
// AgriFarm Backend Server — v2.0
// Security: JWT Auth · RBAC · bcrypt · Rate Limiting · Helmet
// ============================================================

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const path      = require('path');
const fs        = require('fs');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, param, query, validationResult } = require('express-validator');

const pool          = require('./src/config/database');
const logger        = require('./src/utils/logger');
const { verifyToken, optionalAuth } = require('./src/middleware/auth');
const { requireRole }               = require('./src/middleware/rbac');
const { apiLimiter, authLimiter, uploadLimiter } = require('./src/middleware/rateLimiter');
const errorHandler  = require('./src/middleware/errorHandler');

const app  = express();
const PORT = parseInt(process.env.PORT) || 3000;

// ─── JWT Config ───────────────────────────────────────────────
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'agrifarm_access_secret_fallback';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'agrifarm_refresh_secret_fallback';
const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

// ─── Allowed origins ──────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',').map(o => o.trim());

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman) AND allowed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

// ─── Request Parsing ─────────────────────────────────────────
// Limit body size to 10MB (was 50MB — reduces DoS risk)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── HTTP Request Logging (Morgan → Winston) ─────────────────
app.use(morgan('combined', {
  stream: { write: msg => logger.http(msg.trim()) },
  skip: (req) => req.url === '/health'
}));

// ─── Static Files ────────────────────────────────────────────
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ─── Apply Global Rate Limit ──────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Helper: Generate JWT tokens ─────────────────────────────
function generateTokens(user) {
  const payload = {
    id: user.uid,
    email: user.email,
    role: user.role,
    name: user.name,
    jti: require('crypto').randomUUID()
  };
  const accessToken  = jwt.sign(payload, ACCESS_SECRET,  { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
}

// ─── Helper: Crypto, Multer & Image Upload Security ───────────
const crypto = require('crypto');
const multer = require('multer');

// Configure storage destination & filename sanitization
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '') // remove special characters
      .substring(0, 100);             // limit length
    const uniqueName = `${Date.now()}_${uuidv4().substring(0, 8)}_${cleanName}${ext}`;
    cb(null, uniqueName);
  }
});

// Configure file size validation (max 5MB) and type validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('MIME validation failed: Only JPEG, PNG, and WebP images are allowed'), false);
    }
    const ext = path.extname(file.originalname).toLowerCase();
    const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!ALLOWED_EXTS.includes(ext)) {
      return cb(new Error('Extension validation failed: Only .jpg, .jpeg, .png, and .webp extensions are allowed'), false);
    }
    cb(null, true);
  }
});

function handleMulterErrors(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
}

// ─── Helper: Centralized Audit Logging ────────────────────────
async function logAuditEvent(userId, action, entityType, entityId, oldValues, newValues, ip, userAgent) {
  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId || null,
        action,
        entityType,
        entityId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ip || null,
        userAgent || null
      ]
    );
  } catch (err) {
    logger.error('Failed to write audit log:', { error: err.message });
  }
}

// ─── Helper: Normalized Product Images Population ─────────────
async function populateProductImages(productsList) {
  if (!productsList || productsList.length === 0) return productsList;
  const productIds = productsList.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');
  const [images] = await pool.execute(
    `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY is_primary DESC, created_at ASC`,
    productIds
  );
  
  const imagesByProduct = {};
  images.forEach(img => {
    if (!imagesByProduct[img.product_id]) {
      imagesByProduct[img.product_id] = [];
    }
    imagesByProduct[img.product_id].push(img.image_url);
  });

  productsList.forEach(p => {
    const urls = imagesByProduct[p.id] || [];
    p.imageUrls = urls;
    p.imageUrl = urls[0] || '';
  });
  
  return productsList;
}

async function getProductWithImages(productId) {
  const [rows] = await pool.execute(
    `SELECT p.*, s.name AS shopName FROM products p INNER JOIN shops s ON p.shopId = s.id
     WHERE p.id = ? AND p.deleted_at IS NULL`, [productId]
  );
  if (rows.length === 0) return null;
  const product = rows[0];
  const [images] = await pool.execute(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, created_at ASC',
    [productId]
  );
  const urls = images.map(img => img.image_url);
  product.imageUrls = urls;
  product.imageUrl = urls[0] || '';
  return product;
}

// ─── Helper: Validate request via express-validator ──────────
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg || 'Validation failed';
    return res.status(400).json({ error: errorMsg, details: errors.array() });
  }
  next();
}

// ─── Helper: Save base64 image safely ────────────────────────
async function saveBase64Image(base64String, filename) {
  // Validate it is actually an image MIME type
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const mimeMatch = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (mimeMatch && !ALLOWED_TYPES.includes(mimeMatch[1])) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  let cleanBase64 = base64String;
  if (cleanBase64.includes(';base64,')) {
    cleanBase64 = cleanBase64.split(';base64,')[1];
  }

  // Secure: Limit file size to 5MB (approx 6.99 million characters in Base64)
  const approxSizeBytes = (cleanBase64.length * 3) / 4;
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (approxSizeBytes > MAX_SIZE_BYTES) {
    throw new Error('Image size exceeds the 5MB limit');
  }

  // Reject if result is not valid base64 (rough check)
  if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64.substring(0, 100))) {
    throw new Error('Invalid image data');
  }

  const dir = path.join(__dirname, 'public/images');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));
  return `images/${filename}`;
}

function formatProduct(p) {
  if (!p) return p;
  let urls = [];
  if (p.imageUrl) {
    if (typeof p.imageUrl === 'string' && p.imageUrl.startsWith('[')) {
      try {
        urls = JSON.parse(p.imageUrl);
      } catch (e) {
        urls = [p.imageUrl];
      }
    } else {
      urls = [p.imageUrl];
    }
  }
  p.imageUrls = urls;
  p.imageUrl = urls[0] || '';
  return p;
}

// ─── Helper: Order State Machine ─────────────────────────────
const VALID_TRANSITIONS = {
  PENDING:          ['CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMED:        ['PROCESSING', 'CANCELLED'],
  PROCESSING:       ['SHIPPED', 'CANCELLED'],
  SHIPPED:          ['DELIVERED', 'FAILED'],
  DELIVERED:        ['RETURNED'],
  RETURNED:         ['REFUNDED'],
  CANCELLED:        [],
  FAILED:           [],
  REFUNDED:         []
};

function isValidTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 chars'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6, max: 72 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['FARMER', 'SHOP_OWNER']).withMessage('Role must be FARMER or SHOP_OWNER'),
    body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number'),
    body('address').notEmpty().withMessage('Address is required').isLength({ max: 500 }).withMessage('Address too long'),
  ],
  validate,
  async (req, res, next) => {
    const { name, email, phone, role, address, password } = req.body;
    try {
      // Check if email already exists for this role or globally
      const [existing] = await pool.execute(
        'SELECT uid FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL',
        [email.toLowerCase()]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const uid          = uuidv4();
      const passwordHash = await bcrypt.hash(password, 12);

      await pool.execute(
        `INSERT INTO users (uid, name, email, phone, role, address, profileImage, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, '', ?)`,
        [uid, name, email.toLowerCase(), phone || '', role, address || '', passwordHash]
      );

      // Log audit event
      await logAuditEvent(uid, 'REGISTER', 'users', uid, null, { name, email: email.toLowerCase(), role }, req.ip, req.headers['user-agent']);

      const tokens = generateTokens({ uid, email: email.toLowerCase(), role, name });

      // Store refresh token hash
      const refreshHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
      await pool.execute(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [uid, refreshHash]
      );

      logger.info('User registered', { uid, email: email.toLowerCase(), role, ip: req.ip });

      res.status(201).json({
        uid, name, email: email.toLowerCase(), phone: phone || '', role, address: address || '',
        profileImage: '', isSeller: role === 'SHOP_OWNER', isUser: role === 'FARMER',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (err) { next(err); }
  }
);

// POST /api/auth/login
app.post('/api/auth/login',
  authLimiter,
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['FARMER', 'SHOP_OWNER', 'ADMIN']).withMessage('Invalid role'),
  ],
  validate,
  async (req, res, next) => {
    const { email, password, role } = req.body;
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE LOWER(email) = ? AND role = ? AND deleted_at IS NULL',
        [email.toLowerCase(), role]
      );

      if (rows.length === 0) {
        // Check if email exists with a different role (better error message)
        const [anyRole] = await pool.execute(
          'SELECT role FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL',
          [email.toLowerCase()]
        );
        if (anyRole.length > 0) {
          return res.status(400).json({
            error: `This email is registered as ${anyRole[0].role}, not ${role}. Please use the correct login.`
          });
        }
        return res.status(404).json({ error: 'Account not found. Please register first.' });
      }

      const user = rows[0];

      // Check if user is blocked
      if (user.blocked_at) {
        return res.status(403).json({
          error: `Account blocked: ${user.blocked_reason || 'Contact administrator for details.'}`
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        logger.warn('Failed login attempt', { email: email.toLowerCase(), ip: req.ip });
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      // Check dual role status
      const [allRoles] = await pool.execute(
        'SELECT role FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL',
        [email.toLowerCase()]
      );
      const roles    = allRoles.map(r => r.role);
      const isUser   = roles.includes('FARMER');
      const isSeller = roles.includes('SHOP_OWNER');

      const tokens = generateTokens({ uid: user.uid, email: user.email, role: user.role, name: user.name });

      // Store refresh token hash (limit to 5 active sessions per user)
      const refreshHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
      await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < NOW()', [user.uid]);
      await pool.execute(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [user.uid, refreshHash]
      );

      // Audit log
      await logAuditEvent(user.uid, 'LOGIN', 'users', user.uid, null, null, req.ip, req.headers['user-agent']);

      logger.info('User logged in', { uid: user.uid, email: user.email, role: user.role });

      res.json({
        uid: user.uid, name: user.name, email: user.email,
        phone: user.phone, role: user.role, address: user.address,
        profileImage: user.profileImage, isUser, isSeller,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (err) { next(err); }
  }
);

// POST /api/auth/refresh — refresh access token
app.post('/api/auth/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  validate,
  async (req, res, next) => {
    const { refreshToken } = req.body;
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      
      // Hash incoming refresh token
      const incomingRefreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // Verify token is in DB (not revoked)
      const [rows] = await pool.execute(
        'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW() AND revoked_at IS NULL',
        [incomingRefreshHash]
      );
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Refresh token invalid or expired' });
      }

      // Revoke the old refresh token immediately (one-time use rotation)
      await pool.execute(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?',
        [rows[0].id]
      );

      // Fetch fresh user data
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE uid = ? AND deleted_at IS NULL', [decoded.id]
      );
      if (users.length === 0) return res.status(401).json({ error: 'User not found' });

      const user   = users[0];

      // Check if user has been blocked in the database
      if (user.blocked_at) {
        await pool.execute(
          'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
          [user.uid]
        );
        return res.status(403).json({
          error: `Account blocked: ${user.blocked_reason || 'Contact administrator for details.'}`
        });
      }

      // Generate new access and refresh tokens
      const tokens = generateTokens({ uid: user.uid, email: user.email, role: user.role, name: user.name });

      // Save the new refresh token hash
      const newRefreshHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
      await pool.execute(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [user.uid, newRefreshHash]
      );

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Refresh token invalid or expired' });
      }
      next(err);
    }
  }
);

// POST /api/auth/logout
app.post('/api/auth/logout', verifyToken, async (req, res, next) => {
  try {
    // Revoke refresh tokens
    await pool.execute(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
      [req.user.id]
    );

    // Blacklist current access token
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      let expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15m fallback
      if (req.user && req.user.exp) {
        expiresAt = new Date(req.user.exp * 1000);
      }
      
      await pool.execute(
        'INSERT IGNORE INTO access_token_blacklist (id, token_hash, expires_at) VALUES (UUID(), ?, ?)',
        [tokenHash, expiresAt]
      );
    }

    // Write audit log
    await logAuditEvent(req.user.id, 'LOGOUT', 'users', req.user.id, null, null, req.ip, req.headers['user-agent']);

    logger.info('User logged out', { uid: req.user.id });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/users/me — get own profile
app.get('/api/users/me', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT uid, name, email, phone, role, address, profileImage FROM users WHERE uid = ? AND deleted_at IS NULL',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/users/me — update own profile (and optionally change password)
app.put('/api/users/me',
  verifyToken,
  uploadLimiter,
  handleMulterErrors(upload.single('avatar')),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().isMobilePhone(),
    body('address').optional().isLength({ max: 500 }),
    body('password').optional().isLength({ min: 6, max: 72 }).withMessage('Password must be 6–72 characters'),
  ],
  validate,
  async (req, res, next) => {
    const { name, phone, address, profileImage, password } = req.body;
    const uid = req.user.id;
    try {
      let finalImage = profileImage || '';
      if (req.file) {
        finalImage = `images/${req.file.filename}`;
      } else if (profileImage && profileImage.startsWith('data:')) {
        finalImage = await saveBase64Image(profileImage, `avatar_${uid}.png`);
      }

      // If password provided, hash and update it too
      if (password) {
        const newHash = await bcrypt.hash(password, 12);
        await pool.execute(
          'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), profileImage = COALESCE(?, profileImage), password_hash = ?, updated_at = NOW() WHERE uid = ?',
          [name || null, phone || null, address || null, finalImage || null, newHash, uid]
        );
        await logAuditEvent(uid, 'CHANGE_PASSWORD', 'users', uid, null, null, req.ip, req.headers['user-agent']);
      } else {
        await pool.execute(
          'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), profileImage = COALESCE(?, profileImage), updated_at = NOW() WHERE uid = ?',
          [name || null, phone || null, address || null, finalImage || null, uid]
        );
      }

      await logAuditEvent(uid, 'UPDATE_PROFILE', 'users', uid, null, { name, phone, address, profileImage: finalImage }, req.ip, req.headers['user-agent']);

      const [rows] = await pool.execute(
        'SELECT uid, name, email, phone, role, address, profileImage FROM users WHERE uid = ?', [uid]
      );
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// ─── Admin: get all users ─────────────────────────────────────
app.get('/api/users', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT uid, name, email, phone, role, address, profileImage, created_at, is_active, blocked_at, blocked_reason FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── Admin: Soft-delete user ──────────────────────────────────
app.delete('/api/users/:uid', verifyToken, requireRole('ADMIN'),
  [param('uid').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      if (req.params.uid === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
      const [existing] = await pool.execute('SELECT uid FROM users WHERE uid = ? AND deleted_at IS NULL', [req.params.uid]);
      if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

      await pool.execute('UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE uid = ?', [req.params.uid]);
      await logAuditEvent(req.user.id, 'DELETE_USER', 'users', req.params.uid, null, null, req.ip, req.headers['user-agent']);

      logger.info('User soft-deleted by admin', { deletedUid: req.params.uid, adminId: req.user.id });
      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (err) { next(err); }
  }
);

// ─── Admin: Block user ────────────────────────────────────────
app.patch('/api/admin/users/:uid/block', verifyToken, requireRole('ADMIN'),
  [param('uid').notEmpty(), body('reason').optional().isLength({ max: 500 })],
  validate,
  async (req, res, next) => {
    try {
      if (req.params.uid === req.user.id) return res.status(400).json({ error: 'Cannot block your own account' });
      const [existing] = await pool.execute('SELECT uid, name, role FROM users WHERE uid = ? AND deleted_at IS NULL', [req.params.uid]);
      if (existing.length === 0) return res.status(404).json({ error: 'User not found' });
      if (existing[0].role === 'ADMIN') return res.status(403).json({ error: 'Cannot block another admin' });

      await pool.execute(
        'UPDATE users SET blocked_at = NOW(), blocked_reason = ?, is_active = 0 WHERE uid = ?',
        [req.body.reason || 'Blocked by administrator', req.params.uid]
      );
      await logAuditEvent(req.user.id, 'BLOCK_USER', 'users', req.params.uid, null, { reason: req.body.reason }, req.ip, req.headers['user-agent']);
      logger.info('User blocked', { uid: req.params.uid, adminId: req.user.id });
      res.json({ success: true, message: 'User blocked successfully' });
    } catch (err) { next(err); }
  }
);

// ─── Admin: Unblock user ──────────────────────────────────────
app.patch('/api/admin/users/:uid/unblock', verifyToken, requireRole('ADMIN'),
  [param('uid').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const [existing] = await pool.execute('SELECT uid FROM users WHERE uid = ? AND deleted_at IS NULL', [req.params.uid]);
      if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

      await pool.execute(
        'UPDATE users SET blocked_at = NULL, blocked_reason = NULL, is_active = 1 WHERE uid = ?',
        [req.params.uid]
      );
      await logAuditEvent(req.user.id, 'UNBLOCK_USER', 'users', req.params.uid, null, null, req.ip, req.headers['user-agent']);
      logger.info('User unblocked', { uid: req.params.uid, adminId: req.user.id });
      res.json({ success: true, message: 'User unblocked successfully' });
    } catch (err) { next(err); }
  }
);

// ─── Admin: Reset user password ───────────────────────────────
app.post('/api/admin/users/:uid/reset-password', verifyToken, requireRole('ADMIN'),
  [param('uid').notEmpty(), body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  async (req, res, next) => {
    try {
      const [existing] = await pool.execute('SELECT uid, name, email FROM users WHERE uid = ? AND deleted_at IS NULL', [req.params.uid]);
      if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

      const newHash = await bcrypt.hash(req.body.newPassword, 12);
      await pool.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE uid = ?', [newHash, req.params.uid]);
      // Revoke all existing sessions
      await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [req.params.uid]);

      await logAuditEvent(req.user.id, 'RESET_PASSWORD', 'users', req.params.uid, null, null, req.ip, req.headers['user-agent']);
      logger.info('Password reset by admin', { uid: req.params.uid, adminId: req.user.id });
      res.json({ success: true, message: 'Password reset successfully. All existing sessions revoked.' });
    } catch (err) { next(err); }
  }
);

// ─── Backward compat: legacy /api/register & /api/login ───────
// These map to the new auth endpoints for the Android app
app.post('/api/register', async (req, res, next) => {
  req.url = '/api/auth/register';
  app._router.handle({ ...req, url: '/api/auth/register', path: '/api/auth/register' }, res, next);
});

// ─── Legacy login for Android app (passes to new auth handler) ─
app.post('/api/login', authLimiter,
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['FARMER', 'SHOP_OWNER', 'ADMIN']).withMessage('Invalid role'),
  ],
  validate,
  async (req, res, next) => {
    const { email, password, role } = req.body;
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE LOWER(email) = ? AND role = ? AND deleted_at IS NULL',
        [email.toLowerCase(), role]
      );
      if (rows.length === 0) {
        const [anyRole] = await pool.execute('SELECT role FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
        if (anyRole.length > 0) return res.status(400).json({ error: `Email registered as ${anyRole[0].role}, not ${role}` });
        return res.status(404).json({ error: 'User not found. Please register first.' });
      }
      const user = rows[0];

      // Check if account has been blocked
      if (user.blocked_at) {
        return res.status(403).json({ error: `Account blocked: ${user.blocked_reason || 'Contact administrator.'}` });
      }

      if (!user.password_hash) {
        return res.status(400).json({ error: 'Account password is not configured.' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });

      const [allRoles] = await pool.execute('SELECT role FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL', [email.toLowerCase()]);
      const roles = allRoles.map(r => r.role);
      const tokens = generateTokens({ uid: user.uid, email: user.email, role: user.role, name: user.name });

      const refreshHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
      await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < NOW()', [user.uid]);
      await pool.execute(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [user.uid, refreshHash]
      );

      await logAuditEvent(user.uid, 'LOGIN', 'users', user.uid, null, null, req.ip, req.headers['user-agent']);

      res.json({
        uid: user.uid, name: user.name, email: user.email,
        phone: user.phone, role: user.role, address: user.address,
        profileImage: user.profileImage,
        isUser: roles.includes('FARMER'), isSeller: roles.includes('SHOP_OWNER'),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (err) { next(err); }
  }
);

// Legacy update profile (Android app still uses this)
app.post('/api/users/update', verifyToken,
  uploadLimiter,
  handleMulterErrors(upload.single('avatar')),
  [body('uid').notEmpty()],
  validate,
  async (req, res, next) => {
    const { uid, name, phone, address, profileImage } = req.body;
    // Users can only update their own profile (admins can update anyone)
    if (req.user.id !== uid && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Cannot update another user\'s profile' });
    }
    try {
      let finalImage = profileImage || '';
      if (req.file) {
        finalImage = `images/${req.file.filename}`;
      } else if (profileImage && profileImage.startsWith('data:')) {
        finalImage = await saveBase64Image(profileImage, `avatar_${uid}.png`);
      }
      await pool.execute(
        'UPDATE users SET name = ?, phone = ?, address = ?, profileImage = ?, updated_at = NOW() WHERE uid = ?',
        [name, phone, address, finalImage, uid]
      );

      await logAuditEvent(uid, 'UPDATE_PROFILE', 'users', uid, null, { name, phone, address, profileImage: finalImage }, req.ip, req.headers['user-agent']);

      const [rows] = await pool.execute('SELECT uid, name, email, phone, role, address, profileImage FROM users WHERE uid = ?', [uid]);
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ ...rows[0], isSeller: rows[0].role === 'SHOP_OWNER', isUser: rows[0].role === 'FARMER' });
    } catch (err) { next(err); }
  }
);

// ═══════════════════════════════════════════════════════════════
// SHOP ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/shops — public, filtered list
app.get('/api/shops', optionalAuth, async (req, res, next) => {
  const { status, ownerId, search } = req.query;
  try {
    let sql = `SELECT s.*, u.name AS ownerName, u.email AS ownerEmail, u.phone AS ownerPhone, u.address AS ownerAddress
               FROM shops s LEFT JOIN users u ON s.ownerId = u.uid WHERE s.deleted_at IS NULL`;
    const params = [];

    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    if (ownerId) { sql += ' AND s.ownerId = ?'; params.push(ownerId); }
    if (search)  { sql += ' AND s.name LIKE ?'; params.push(`%${search}%`); }

    // Non-admins only see APPROVED shops
    if (!req.user || req.user.role !== 'ADMIN') {
      if (!status && !ownerId) { sql += ' AND s.status = ?'; params.push('APPROVED'); }
    }

    sql += ' ORDER BY s.rating DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/shops/:id
app.get('/api/shops/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, u.name AS ownerName, u.email AS ownerEmail, u.phone AS ownerPhone
       FROM shops s LEFT JOIN users u ON s.ownerId = u.uid
       WHERE s.id = ? AND s.deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Shop not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/shops — create or update own shop
app.post('/api/shops', verifyToken, requireRole('SHOP_OWNER', 'ADMIN'),
  uploadLimiter,
  handleMulterErrors(upload.fields([
    { name: 'shopImage', maxCount: 1 },
    { name: 'qrCodeImage', maxCount: 1 }
  ])),
  [
    body('name').trim().notEmpty().withMessage('Shop name is required').isLength({ min: 2, max: 150 }).withMessage('Shop name must be 2–150 characters'),
    body('category').trim().notEmpty().withMessage('Shop category is required'),
    body('ownerId').notEmpty().withMessage('Owner ID is required'),
  ],
  validate,
  async (req, res, next) => {
    const { name, ownerId, address, description, category, imageUrl, imageBase64, qrCodeUrl, qrCodeBase64 } = req.body;
    // SHOP_OWNER can only create/update their own shop
    if (req.user.role === 'SHOP_OWNER' && req.user.id !== ownerId) {
      return res.status(403).json({ error: 'Cannot create a shop for another owner' });
    }
    try {
      const [existing] = await pool.execute('SELECT * FROM shops WHERE ownerId = ? AND deleted_at IS NULL', [ownerId]);
      const shopId = existing.length > 0 ? existing[0].id : uuidv4();
      
      let finalImage = imageUrl || 'images/seeds_shop.png';
      if (req.files && req.files['shopImage'] && req.files['shopImage'][0]) {
        finalImage = `images/${req.files['shopImage'][0].filename}`;
      } else if (imageBase64) {
        try { finalImage = await saveBase64Image(imageBase64, `shop_${shopId}.png`); }
        catch (imgErr) { logger.warn('Shop image save failed', { error: imgErr.message }); }
      }

      let finalQrCode = qrCodeUrl || (existing.length > 0 ? existing[0].qrCodeUrl : '');
      if (req.files && req.files['qrCodeImage'] && req.files['qrCodeImage'][0]) {
        finalQrCode = `images/${req.files['qrCodeImage'][0].filename}`;
      } else if (qrCodeBase64) {
        try { finalQrCode = await saveBase64Image(qrCodeBase64, `qr_${shopId}.png`); }
        catch (imgErr) { logger.warn('Shop QR Code save failed', { error: imgErr.message }); }
      }

      if (existing.length > 0) {
        const oldVals = { name: existing[0].name, address: existing[0].address, description: existing[0].description, category: existing[0].category };
        const newVals = { name, address: address || '', description: description || '', category: category || 'General Store' };
        await pool.execute(
          'UPDATE shops SET name=?, address=?, description=?, category=?, imageUrl=?, qrCodeUrl=?, status=?, updated_at=NOW() WHERE id=?',
          [name, address||'', description||'', category||'General Store', finalImage, finalQrCode, existing[0].status, shopId]
        );
        await logAuditEvent(req.user.id, 'UPDATE_SHOP', 'shops', shopId, oldVals, newVals, req.ip, req.headers['user-agent']);
      } else {
        await pool.execute(
          'INSERT INTO shops (id, ownerId, name, address, rating, imageUrl, qrCodeUrl, description, category, status) VALUES (?, ?, ?, ?, 5.0, ?, ?, ?, ?, \'PENDING\')',
          [shopId, ownerId, name, address||'', finalImage, finalQrCode, description||'', category||'General Store']
        );
        await logAuditEvent(req.user.id, 'CREATE_SHOP', 'shops', shopId, null, { name, ownerId, category }, req.ip, req.headers['user-agent']);
      }
      const [rows] = await pool.execute('SELECT * FROM shops WHERE id = ?', [shopId]);
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// PATCH /api/shops/:id/status — admin approve/reject
app.post('/api/shops/:id/status', verifyToken, requireRole('ADMIN'),
  [body('status').isIn(['APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'])],
  validate,
  async (req, res, next) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM shops WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Shop not found' });

      await pool.execute('UPDATE shops SET status = ?, updated_at = NOW() WHERE id = ?', [req.body.status, req.params.id]);

      await logAuditEvent(
        req.user.id,
        'UPDATE_SHOP_STATUS',
        'shops',
        req.params.id,
        { status: existing[0].status },
        { status: req.body.status },
        req.ip,
        req.headers['user-agent']
      );

      const [updated] = await pool.execute('SELECT * FROM shops WHERE id = ?', [req.params.id]);
      res.json(updated[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/shops/:id — admin soft delete
app.delete('/api/shops/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await pool.execute('UPDATE shops SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Shop removed successfully' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════
// PRODUCT ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/products — public
app.get('/api/products', optionalAuth, async (req, res, next) => {
  const { shopId, category, search, minPrice, maxPrice, sortBy, page, limit } = req.query;
  try {
    let sql = `SELECT p.*, s.name AS shopName FROM products p INNER JOIN shops s ON p.shopId = s.id
               WHERE p.deleted_at IS NULL AND p.is_active = 1 AND s.deleted_at IS NULL`;
    const params = [];

    if (shopId)   { sql += ' AND p.shopId = ?';   params.push(shopId); }
    else          { sql += ' AND s.status = \'APPROVED\''; }

    if (category && category !== 'All') { sql += ' AND p.category = ?'; params.push(category); }
    if (search)   { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (minPrice) { sql += ' AND p.price >= ?'; params.push(parseFloat(minPrice)); }
    if (maxPrice) { sql += ' AND p.price <= ?'; params.push(parseFloat(maxPrice)); }

    const SORT_MAP = { rating: 'p.rating DESC', price_asc: 'p.price ASC', price_desc: 'p.price DESC', newest: 'p.created_at DESC' };
    sql += ` ORDER BY ${SORT_MAP[sortBy] || 'p.rating DESC'}`;

    let limitVal = parseInt(limit);
    let pageVal = parseInt(page);
    if (!isNaN(limitVal) && !isNaN(pageVal) && limitVal > 0 && pageVal > 0) {
      const offset = (pageVal - 1) * limitVal;
      sql += ' LIMIT ? OFFSET ?';
      params.push(String(limitVal), String(offset));
    }

    const [rows] = await pool.execute(sql, params);
    const populated = await populateProductImages(rows);
    res.json(populated);
  } catch (err) { next(err); }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = await getProductWithImages(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// POST /api/products — SHOP_OWNER adds product
app.post('/api/products', verifyToken, requireRole('SHOP_OWNER', 'ADMIN'),
  uploadLimiter,
  handleMulterErrors(upload.array('productImages', 5)),
  [
    body('shopId').notEmpty().withMessage('Shop ID is required'),
    body('name').trim().notEmpty().withMessage('Product name is required').isLength({ min: 2, max: 200 }).withMessage('Product name must be 2–200 characters'),
    body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').notEmpty().withMessage('Stock is required').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category').notEmpty().withMessage('Category is required').isIn(['Seeds','Fertilizers','Pesticides','Weed Killers','Tools','Other']).withMessage('Invalid category'),
  ],
  validate,
  async (req, res, next) => {
    const { shopId, name, category, price, stock, description, usageInstructions, imageUrl, imageBase64, imagesBase64 } = req.body;

    // SHOP_OWNER can only add to their own shop
    if (req.user.role === 'SHOP_OWNER') {
      const [shop] = await pool.execute('SELECT ownerId FROM shops WHERE id = ? AND deleted_at IS NULL', [shopId]);
      if (shop.length === 0) return res.status(404).json({ error: 'Shop not found' });
      if (shop[0].ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: Not your shop' });
    }

    try {
      const productId = uuidv4();
      let finalImages = [];
      
      // Process uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          finalImages.push(`images/${file.filename}`);
        });
      } else if (imagesBase64 && Array.isArray(imagesBase64)) {
        for (let i = 0; i < imagesBase64.length; i++) {
          try {
            const savedPath = await saveBase64Image(imagesBase64[i], `product_${productId}_${i}.png`);
            finalImages.push(savedPath);
          } catch (imgErr) {
            logger.warn('Product image save failed', { index: i, error: imgErr.message });
          }
        }
      } else if (imageBase64) {
        try {
          const savedPath = await saveBase64Image(imageBase64, `product_${productId}.png`);
          finalImages.push(savedPath);
        } catch (imgErr) {
          logger.warn('Product image save failed', { error: imgErr.message });
        }
      } else if (imageUrl) {
        try {
          const parsed = JSON.parse(imageUrl);
          if (Array.isArray(parsed)) finalImages = parsed;
          else finalImages = [imageUrl];
        } catch (e) {
          finalImages = [imageUrl];
        }
      }

      const finalImageUrl = finalImages.length > 0 ? JSON.stringify(finalImages) : '';

      await pool.execute(
        `INSERT INTO products (id, shopId, name, category, price, stock, description, imageUrl, usageInstructions, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0)`,
        [productId, shopId, name, category, parseFloat(price), parseInt(stock), description||'', finalImageUrl, usageInstructions||'']
      );

      // Insert into product_images table
      for (let i = 0; i < finalImages.length; i++) {
        const imageId = uuidv4();
        await pool.execute(
          'INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES (?, ?, ?, ?)',
          [imageId, productId, finalImages[i], i === 0 ? 1 : 0]
        );
      }

      // Create initial inventory log entry
      await pool.execute(
        'INSERT INTO inventory_logs (product_id, change_qty, reason, stock_after) VALUES (?, ?, \'RESTOCK\', ?)',
        [productId, parseInt(stock), parseInt(stock)]
      );

      // Log audit event
      await logAuditEvent(req.user.id, 'CREATE_PRODUCT', 'products', productId, null, { name, category, price, stock }, req.ip, req.headers['user-agent']);

      const created = await getProductWithImages(productId);
      res.status(201).json(created);
    } catch (err) { next(err); }
  }
);

// PUT /api/products/:id — update product
app.post('/api/products/:id', verifyToken, requireRole('SHOP_OWNER', 'ADMIN'),
  uploadLimiter,
  handleMulterErrors(upload.array('productImages', 5)),
  [
    body('name').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    const { name, category, price, stock, description, usageInstructions, imageUrl, imageBase64, imagesBase64 } = req.body;
    try {
      const [existing] = await pool.execute('SELECT * FROM products WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });

      // SHOP_OWNER: verify ownership
      if (req.user.role === 'SHOP_OWNER') {
        const [shop] = await pool.execute('SELECT ownerId FROM shops WHERE id = ?', [existing[0].shopId]);
        if (shop[0].ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: Not your product' });
      }

      const oldStock = existing[0].stock;
      const newStock = stock !== undefined ? parseInt(stock) : oldStock;

      let finalImages = [];
      let newImagesUploaded = false;

      if (req.files && req.files.length > 0) {
        newImagesUploaded = true;
        req.files.forEach(file => {
          finalImages.push(`images/${file.filename}`);
        });
      } else if (imagesBase64 && Array.isArray(imagesBase64)) {
        newImagesUploaded = true;
        for (let i = 0; i < imagesBase64.length; i++) {
          try {
            const savedPath = await saveBase64Image(imagesBase64[i], `product_${req.params.id}_${Date.now()}_${i}.png`);
            finalImages.push(savedPath);
          } catch (imgErr) {
            logger.warn('Product image save failed', { index: i, error: imgErr.message });
          }
        }
      } else if (imageBase64) {
        newImagesUploaded = true;
        try {
          const savedPath = await saveBase64Image(imageBase64, `product_${req.params.id}_${Date.now()}.png`);
          finalImages.push(savedPath);
        } catch (imgErr) {
          logger.warn('Product image save failed', { error: imgErr.message });
        }
      }

      let finalImageUrl = undefined;
      if (newImagesUploaded) {
        finalImageUrl = JSON.stringify(finalImages);
      } else if (imageUrl !== undefined) {
        finalImageUrl = imageUrl;
      }

      await pool.execute(
        'UPDATE products SET name=COALESCE(?,name), category=COALESCE(?,category), price=COALESCE(?,price), stock=COALESCE(?,stock), description=COALESCE(?,description), usageInstructions=COALESCE(?,usageInstructions), imageUrl=COALESCE(?,imageUrl), updated_at=NOW() WHERE id=?',
        [name||null, category||null, price?parseFloat(price):null, stock!==undefined?newStock:null, description||null, usageInstructions||null, finalImageUrl !== undefined ? finalImageUrl : null, req.params.id]
      );

      // If new images were uploaded, update the product_images table
      if (newImagesUploaded && finalImages.length > 0) {
        // Delete existing images for this product
        await pool.execute('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);
        
        // Insert new ones
        for (let i = 0; i < finalImages.length; i++) {
          const imageId = uuidv4();
          await pool.execute(
            'INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES (?, ?, ?, ?)',
            [imageId, req.params.id, finalImages[i], i === 0 ? 1 : 0]
          );
        }
      }

      // Log stock change
      if (stock !== undefined && newStock !== oldStock) {
        await pool.execute(
          'INSERT INTO inventory_logs (product_id, change_qty, reason, stock_after) VALUES (?, ?, \'ADJUSTMENT\', ?)',
          [req.params.id, newStock - oldStock, newStock]
        );
      }

      // Audit log the update event
      const oldVals = { name: existing[0].name, price: existing[0].price, stock: existing[0].stock };
      const newVals = { name: name || existing[0].name, price: price !== undefined ? parseFloat(price) : existing[0].price, stock: stock !== undefined ? parseInt(stock) : existing[0].stock };
      await logAuditEvent(req.user.id, 'UPDATE_PRODUCT', 'products', req.params.id, oldVals, newVals, req.ip, req.headers['user-agent']);

      const updated = await getProductWithImages(req.params.id);
      res.json(updated);
    } catch (err) { next(err); }
  }
);

// DELETE /api/products/:id — soft delete
app.delete('/api/products/:id', verifyToken, requireRole('SHOP_OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const [existing] = await pool.execute('SELECT p.*, s.ownerId FROM products p JOIN shops s ON p.shopId = s.id WHERE p.id = ? AND p.deleted_at IS NULL', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });

    if (req.user.role === 'SHOP_OWNER' && existing[0].ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Not your product' });
    }

    await pool.execute('UPDATE products SET deleted_at = NOW(), is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════
// WISHLIST ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/wishlist — farmer's wishlist
app.get('/api/wishlist', verifyToken, requireRole('FARMER'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT w.id, w.created_at, p.id as productId, p.name, p.price, p.imageUrl, p.rating, p.category, p.stock, s.name AS shopName
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id
       JOIN shops s ON p.shopId = s.id
       WHERE w.user_id = ? AND p.deleted_at IS NULL ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map(formatProduct));
  } catch (err) { next(err); }
});

// POST /api/wishlist/:productId — toggle wishlist
app.post('/api/wishlist/:productId', verifyToken, requireRole('FARMER'), async (req, res, next) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]
    );
    if (existing.length > 0) {
      await pool.execute('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
      return res.json({ wishlisted: false, message: 'Removed from wishlist' });
    }
    await pool.execute(
      'INSERT INTO wishlist (id, user_id, product_id) VALUES (UUID(), ?, ?)', [req.user.id, req.params.productId]
    );
    res.json({ wishlisted: true, message: 'Added to wishlist' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════
// ORDER ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/orders — role-filtered
app.get('/api/orders', verifyToken, async (req, res, next) => {
  const { buyerId, shopId, status } = req.query;
  try {
    let sql = `SELECT o.*, s.name AS shopName, s.qrCodeUrl AS shopQrCode, u.name AS buyerName, u.phone AS buyerPhone 
               FROM orders o 
               LEFT JOIN shops s ON o.shopId = s.id 
               LEFT JOIN users u ON o.farmerUid = u.uid 
               WHERE 1=1`;
    const params = [];

    if (req.user.role === 'FARMER') {
      sql += ' AND o.farmerUid = ?'; params.push(req.user.id);
    } else if (req.user.role === 'SHOP_OWNER') {
      // Seller sees orders for their shop
      if (shopId) { sql += ' AND o.shopId = ?'; params.push(shopId); }
      else {
        const [myShop] = await pool.execute('SELECT id FROM shops WHERE ownerId = ? AND deleted_at IS NULL', [req.user.id]);
        if (myShop.length > 0) { sql += ' AND o.shopId = ?'; params.push(myShop[0].id); }
      }
    } else if (req.user.role === 'ADMIN') {
      if (buyerId) { sql += ' AND o.farmerUid = ?'; params.push(buyerId); }
      if (shopId)  { sql += ' AND o.shopId = ?';    params.push(shopId); }
    }

    if (status) { sql += ' AND o.status = ?'; params.push(status); }
    sql += ' ORDER BY o.created_at DESC';

    const [orders] = await pool.execute(sql, params);
    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map(o => o.orderId);
    const placeholders = orderIds.map(() => '?').join(',');
    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE orderId IN (' + placeholders + ')',
      orderIds
    );

    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.orderId]) {
        itemsByOrder[item.orderId] = [];
      }
      itemsByOrder[item.orderId].push({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        lineTotal: parseFloat(item.price) * item.quantity
      });
    });

    const response = orders.map(o => ({
      ...o,
      items: itemsByOrder[o.orderId] || [],
      timestamp: o.created_at ? new Date(o.created_at).getTime() : Date.now()
    }));

    res.json(response);
  } catch (err) { next(err); }
});

// POST /api/orders — place order with atomic stock decrement
app.post('/api/orders', verifyToken, requireRole('FARMER'),
  [
    body('shopId').notEmpty(),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  ],
  validate,
  async (req, res, next) => {
    const { shopId, items, deliveryAddress, notes } = req.body;
    const farmerUid = req.user.id;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Generate human-readable order number
      const dateStr  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const [lastOrd] = await connection.execute('SELECT COUNT(*) as cnt FROM orders');
      const seq      = String(lastOrd[0].cnt + 1).padStart(4, '0');
      const orderId  = `ORD-${dateStr}-${seq}`;

      let subtotal = 0;

      // Validate each item and decrement stock atomically
      for (const item of items) {
        const [prodRows] = await connection.execute(
          'SELECT id, price, stock FROM products WHERE id = ? AND deleted_at IS NULL AND is_active = 1 FOR UPDATE',
          [item.productId]
        );
        if (prodRows.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: `Product ${item.productId} not found or unavailable` });
        }
        const prod = prodRows[0];
        const qty  = parseInt(item.quantity) || 1;
        if (prod.stock < qty) {
          await connection.rollback();
          return res.status(409).json({ error: `Insufficient stock for product ${item.productId}. Available: ${prod.stock}` });
        }
        // Use server-side price — never trust client price
        subtotal += prod.price * qty;

        // Decrement stock
        await connection.execute('UPDATE products SET stock = stock - ?, updated_at = NOW() WHERE id = ?', [qty, prod.id]);
        // Log inventory change
        await connection.execute(
          'INSERT INTO inventory_logs (product_id, change_qty, reason, ref_id, stock_after) VALUES (?, ?, \'SALE\', ?, ?)',
          [prod.id, -qty, orderId, prod.stock - qty]
        );
      }

      const totalAmount = subtotal; // Add delivery fee logic here if needed

      // Insert order
      await connection.execute(
        `INSERT INTO orders (orderId, farmerUid, shopId, subtotal, totalAmount, deliveryAddress, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
        [orderId, farmerUid, shopId, subtotal, totalAmount, deliveryAddress, notes || '']
      );

      // Insert order items (with server-verified prices)
      for (const item of items) {
        const [p] = await connection.execute('SELECT price, name FROM products WHERE id = ?', [item.productId]);
        const prod = p[0];
        await connection.execute(
          'INSERT INTO order_items (orderId, productId, name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.productId, item.productName || prod.name, parseInt(item.quantity) || 1, prod.price]
        );
      }

      await connection.commit();
      logger.info('Order placed', { orderId, farmerUid, shopId, totalAmount });
      await logAuditEvent(farmerUid, 'PLACE_ORDER', 'orders', orderId, null, { shopId, totalAmount, deliveryAddress }, req.ip, req.headers['user-agent']);

      const [orderRows] = await pool.execute('SELECT * FROM orders WHERE orderId = ?', [orderId]);
      const [itemRows]  = await pool.execute('SELECT * FROM order_items WHERE orderId = ?', [orderId]);
      res.status(201).json({ ...orderRows[0], items: itemRows, timestamp: new Date(orderRows[0].created_at).getTime() });
    } catch (err) {
      await connection.rollback();
      next(err);
    } finally {
      connection.release();
    }
  }
);

// PATCH /api/orders/:id/status — state machine validation
app.post('/api/orders/:id/status', verifyToken, requireRole('SHOP_OWNER', 'ADMIN'),
  [body('status').notEmpty()],
  validate,
  async (req, res, next) => {
    const { status } = req.body;
    try {
      const [existing] = await pool.execute('SELECT * FROM orders WHERE orderId = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Order not found' });

      const order = existing[0];

      // SHOP_OWNER: can only update orders for their own shop
      if (req.user.role === 'SHOP_OWNER') {
        const [shop] = await pool.execute('SELECT ownerId FROM shops WHERE id = ?', [order.shopId]);
        if (!shop.length || shop[0].ownerId !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden: Not your order' });
        }
      }

      // Enforce state machine
      if (!isValidTransition(order.status, status)) {
        return res.status(400).json({
          error: `Invalid transition: ${order.status} → ${status}`,
          allowedTransitions: VALID_TRANSITIONS[order.status] || []
        });
      }

      await pool.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE orderId = ?', [status, req.params.id]);

      await logAuditEvent(
        req.user.id,
        'UPDATE_ORDER_STATUS',
        'orders',
        req.params.id,
        { status: order.status },
        { status },
        req.ip,
        req.headers['user-agent']
      );

      const [updatedOrder] = await pool.execute('SELECT * FROM orders WHERE orderId = ?', [req.params.id]);
      const [itemRows]     = await pool.execute('SELECT productId, name, quantity, price FROM order_items WHERE orderId = ?', [req.params.id]);
      res.json({ ...updatedOrder[0], items: itemRows.map(i => ({ ...i, productName: i.name })), timestamp: new Date(updatedOrder[0].created_at).getTime() });
    } catch (err) { next(err); }
  }
);

// ═══════════════════════════════════════════════════════════════
// REVIEWS ROUTES
// ═══════════════════════════════════════════════════════════════

// POST /api/reviews — verified buyer review
app.post('/api/reviews', verifyToken, requireRole('FARMER'),
  [
    body('productId').notEmpty(),
    body('orderId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').optional().isLength({ max: 200 }),
    body('body').optional().isLength({ max: 2000 }),
  ],
  validate,
  async (req, res, next) => {
    const { productId, orderId, rating, title, body: reviewBody } = req.body;
    try {
      // Verify user actually bought this product
      const [orderCheck] = await pool.execute(
        `SELECT oi.productId FROM orders o JOIN order_items oi ON o.orderId = oi.orderId
         WHERE o.orderId = ? AND o.farmerUid = ? AND o.status = 'DELIVERED' AND oi.productId = ?`,
        [orderId, req.user.id, productId]
      );
      if (orderCheck.length === 0) {
        return res.status(403).json({ error: 'You can only review products from delivered orders' });
      }

      // Check no duplicate review
      const [dupCheck] = await pool.execute(
        'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?',
        [req.user.id, productId, orderId]
      );
      if (dupCheck.length > 0) return res.status(409).json({ error: 'You have already reviewed this product' });

      const reviewId = uuidv4();
      await pool.execute(
        'INSERT INTO reviews (id, product_id, user_id, order_id, rating, title, body) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [reviewId, productId, req.user.id, orderId, rating, title || '', reviewBody || '']
      );

      // Update product rating average (trigger handles this if supported, or do it here)
      await pool.execute(
        `UPDATE products SET 
           rating = (SELECT ROUND(AVG(rating),2) FROM reviews WHERE product_id = ?),
           total_reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
         WHERE id = ?`,
        [productId, productId, productId]
      );

      res.status(201).json({ id: reviewId, message: 'Review submitted successfully' });
    } catch (err) { next(err); }
  }
);

// GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.rating, r.title, r.body, r.created_at, u.name as authorName
       FROM reviews r JOIN users u ON r.user_id = u.uid
       WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/notifications
app.get('/api/notifications', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
app.patch('/api/notifications/:id/read', verifyToken, async (req, res, next) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all
app.patch('/api/notifications/read-all', verifyToken, async (req, res, next) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/dashboard — analytics summary
app.get('/api/admin/dashboard', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [[{ totalUsers }]]     = await pool.execute('SELECT COUNT(*) as totalUsers FROM users WHERE deleted_at IS NULL');
    const [[{ totalSellers }]]   = await pool.execute('SELECT COUNT(*) as totalSellers FROM users WHERE role = \'SHOP_OWNER\' AND deleted_at IS NULL');
    const [[{ totalFarmers }]]   = await pool.execute('SELECT COUNT(*) as totalFarmers FROM users WHERE role = \'FARMER\' AND deleted_at IS NULL');
    const [[{ blockedUsers }]]   = await pool.execute('SELECT COUNT(*) as blockedUsers FROM users WHERE blocked_at IS NOT NULL AND deleted_at IS NULL');
    const [[{ totalShops }]]     = await pool.execute('SELECT COUNT(*) as totalShops FROM shops WHERE deleted_at IS NULL');
    const [[{ pendingShops }]]   = await pool.execute('SELECT COUNT(*) as pendingShops FROM shops WHERE status = \'PENDING\' AND deleted_at IS NULL');
    const [[{ approvedShops }]]  = await pool.execute('SELECT COUNT(*) as approvedShops FROM shops WHERE status = \'APPROVED\' AND deleted_at IS NULL');
    const [[{ totalProducts }]]  = await pool.execute('SELECT COUNT(*) as totalProducts FROM products WHERE deleted_at IS NULL');
    const [[{ outOfStock }]]     = await pool.execute('SELECT COUNT(*) as outOfStock FROM products WHERE stock = 0 AND deleted_at IS NULL');
    const [[{ lowStock }]]       = await pool.execute('SELECT COUNT(*) as lowStock FROM products WHERE stock > 0 AND stock <= 10 AND deleted_at IS NULL');
    const [[{ totalOrders }]]    = await pool.execute('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalRevenue }]]   = await pool.execute('SELECT COALESCE(SUM(totalAmount),0) as totalRevenue FROM orders WHERE status = \'DELIVERED\'');
    const [[{ pendingOrders }]]  = await pool.execute('SELECT COUNT(*) as pendingOrders FROM orders WHERE status = \'PENDING\'');
    const [[{ monthlyRevenue }]] = await pool.execute(
      'SELECT COALESCE(SUM(totalAmount),0) as monthlyRevenue FROM orders WHERE status = \'DELIVERED\' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    const [recentOrders] = await pool.execute(
      `SELECT o.orderId, u.name as farmerName, s.name as shopName, o.totalAmount, o.status, o.created_at 
       FROM orders o 
       LEFT JOIN users u ON o.farmerUid = u.uid 
       LEFT JOIN shops s ON o.shopId = s.id 
       ORDER BY o.created_at DESC LIMIT 5`
    );
    const [recentUsers] = await pool.execute(
      'SELECT uid, name, email, role, created_at, blocked_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5'
    );
    const [recentShops] = await pool.execute(
      `SELECT s.id, s.name, s.status, s.created_at, u.name as ownerName 
       FROM shops s LEFT JOIN users u ON s.ownerId = u.uid 
       WHERE s.deleted_at IS NULL ORDER BY s.created_at DESC LIMIT 5`
    );

    res.json({
      users: { total: totalUsers, sellers: totalSellers, farmers: totalFarmers, blocked: blockedUsers },
      shops: { total: totalShops, pending: pendingShops, approved: approvedShops },
      products: { total: totalProducts, outOfStock, lowStock },
      orders: { total: totalOrders, pending: pendingOrders, revenue: totalRevenue, monthlyRevenue },
      recentOrders,
      recentUsers,
      recentShops
    });
  } catch (err) { next(err); }
});

// GET /api/admin/shops — enhanced shop list with owner details
app.get('/api/admin/shops', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = `SELECT s.*, u.name as ownerName, u.email as ownerEmail, u.phone as ownerPhone, u.address as ownerAddress,
               (SELECT COUNT(*) FROM products p WHERE p.shopId = s.id AND p.deleted_at IS NULL) as productCount,
               (SELECT COUNT(*) FROM orders o WHERE o.shopId = s.id) as orderCount,
               (SELECT COALESCE(SUM(totalAmount),0) FROM orders o WHERE o.shopId = s.id AND o.status = 'DELIVERED') as totalRevenue
               FROM shops s LEFT JOIN users u ON s.ownerId = u.uid
               WHERE s.deleted_at IS NULL`;
    const params = [];
    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    if (search) { sql += ' AND (s.name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM (${sql}) t`, params);
    sql += ` ORDER BY s.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const [rows] = await pool.execute(sql, params);
    res.json({ shops: rows, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

// GET /api/admin/reports/registrations — monthly registration trend
app.get('/api/admin/reports/registrations', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [userTrend] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, role, COUNT(*) as count
       FROM users WHERE deleted_at IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month, role ORDER BY month ASC`
    );
    const [shopTrend] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, status, COUNT(*) as count
       FROM shops WHERE deleted_at IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month, status ORDER BY month ASC`
    );
    res.json({ userTrend, shopTrend });
  } catch (err) { next(err); }
});

// GET /api/admin/reports/revenue — revenue analytics
app.get('/api/admin/reports/revenue', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [monthlyRevenue] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, 
              COALESCE(SUM(totalAmount),0) as revenue, COUNT(*) as orders
       FROM orders WHERE status = 'DELIVERED' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`
    );
    const [revenueByShop] = await pool.execute(
      `SELECT s.name as shopName, COALESCE(SUM(o.totalAmount),0) as revenue, COUNT(o.orderId) as orders
       FROM shops s LEFT JOIN orders o ON s.id = o.shopId AND o.status = 'DELIVERED'
       WHERE s.deleted_at IS NULL GROUP BY s.id ORDER BY revenue DESC LIMIT 10`
    );
    const [orderStatusBreakdown] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );
    res.json({ monthlyRevenue, revenueByShop, orderStatusBreakdown });
  } catch (err) { next(err); }
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = 'SELECT al.*, u.name as userName FROM audit_logs al LEFT JOIN users u ON al.user_id = u.uid WHERE 1=1';
    const params = [];
    if (action) { sql += ' AND al.action = ?'; params.push(action); }
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1${action ? ' AND al.action = ?' : ''}`, action ? [action] : []);
    sql += ` ORDER BY al.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const [rows] = await pool.execute(sql, params);
    res.json({ logs: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ─── Production JWT security checks ───────────────────────────
if (process.env.NODE_ENV === 'production' &&
    (ACCESS_SECRET === 'agrifarm_access_secret_fallback' || REFRESH_SECRET === 'agrifarm_refresh_secret_fallback')) {
  logger.error('CRITICAL SECURITY ALERT: Fallback JWT secrets are not allowed in production! Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET env variables.');
  process.exit(1);
}

// ─── Public Content Endpoints (Dynamic App Data) ──────────────
// GET /api/mandi-prices
app.get('/api/mandi-prices', async (req, res, next) => {
  const { district } = req.query;
  try {
    let sql = 'SELECT * FROM mandi_prices';
    const params = [];
    if (district && district !== 'All') {
      sql += ' WHERE district = ?';
      params.push(district);
    }
    sql += ' ORDER BY crop_name ASC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/crop-diseases
app.get('/api/crop-diseases', async (req, res, next) => {
  const { crop } = req.query;
  try {
    let sql = 'SELECT * FROM crop_diseases';
    const params = [];
    if (crop) {
      sql += ' WHERE crop_name = ?';
      params.push(crop);
    }
    const [rows] = await pool.execute(sql, params);
    const formatted = rows.map(r => ({
      ...r,
      symptoms: typeof r.symptoms === 'string' ? JSON.parse(r.symptoms) : r.symptoms,
      solutions: typeof r.solutions === 'string' ? JSON.parse(r.solutions) : r.solutions
    }));
    res.json(formatted);
  } catch (err) { next(err); }
});

// GET /api/weather
app.get('/api/weather', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM weather_forecasts ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── Admin Content CRUD Endpoints ──────────────────────────────
// GET /api/admin/mandi-prices
app.get('/api/admin/mandi-prices', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM mandi_prices ORDER BY crop_name ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/admin/mandi-prices
app.post('/api/admin/mandi-prices', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { crop_name, variety, min_price, max_price, price_change, trend, district } = req.body;
  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO mandi_prices (id, crop_name, variety, min_price, max_price, price_change, trend, district)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, crop_name, variety, parseFloat(min_price), parseFloat(max_price), parseFloat(price_change || 0), trend || 'STABLE', district]
    );
    const [created] = await pool.execute('SELECT * FROM mandi_prices WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/mandi-prices/:id
app.put('/api/admin/mandi-prices/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { crop_name, variety, min_price, max_price, price_change, trend, district } = req.body;
  try {
    await pool.execute(
      `UPDATE mandi_prices SET
         crop_name = COALESCE(?, crop_name),
         variety = COALESCE(?, variety),
         min_price = COALESCE(?, min_price),
         max_price = COALESCE(?, max_price),
         price_change = COALESCE(?, price_change),
         trend = COALESCE(?, trend),
         district = COALESCE(?, district)
       WHERE id = ?`,
      [crop_name || null, variety || null, min_price || null, max_price || null, price_change || null, trend || null, district || null, req.params.id]
    );
    const [updated] = await pool.execute('SELECT * FROM mandi_prices WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/mandi-prices/:id
app.delete('/api/admin/mandi-prices/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM mandi_prices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Mandi price record deleted' });
  } catch (err) { next(err); }
});

// GET /api/admin/crop-diseases
app.get('/api/admin/crop-diseases', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM crop_diseases ORDER BY crop_name ASC');
    const formatted = rows.map(r => ({
      ...r,
      symptoms: typeof r.symptoms === 'string' ? JSON.parse(r.symptoms) : r.symptoms,
      solutions: typeof r.solutions === 'string' ? JSON.parse(r.solutions) : r.solutions
    }));
    res.json(formatted);
  } catch (err) { next(err); }
});

// POST /api/admin/crop-diseases
app.post('/api/admin/crop-diseases', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { crop_name, disease_name, scientific_name, confidence, severity, description, symptoms, solutions, recommended_product_name, recommended_product_price, recommended_product_category } = req.body;
  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO crop_diseases (id, crop_name, disease_name, scientific_name, confidence, severity, description, symptoms, solutions, recommended_product_name, recommended_product_price, recommended_product_category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, crop_name, disease_name, scientific_name, parseInt(confidence), severity || 'MEDIUM', description || '',
        JSON.stringify(symptoms || []), JSON.stringify(solutions || []),
        recommended_product_name || '', recommended_product_price || '', recommended_product_category || ''
      ]
    );
    const [created] = await pool.execute('SELECT * FROM crop_diseases WHERE id = ?', [id]);
    res.status(201).json({
      ...created[0],
      symptoms: typeof created[0].symptoms === 'string' ? JSON.parse(created[0].symptoms) : created[0].symptoms,
      solutions: typeof created[0].solutions === 'string' ? JSON.parse(created[0].solutions) : created[0].solutions
    });
  } catch (err) { next(err); }
});

// PUT /api/admin/crop-diseases/:id
app.put('/api/admin/crop-diseases/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { crop_name, disease_name, scientific_name, confidence, severity, description, symptoms, solutions, recommended_product_name, recommended_product_price, recommended_product_category } = req.body;
  try {
    await pool.execute(
      `UPDATE crop_diseases SET
         crop_name = COALESCE(?, crop_name),
         disease_name = COALESCE(?, disease_name),
         scientific_name = COALESCE(?, scientific_name),
         confidence = COALESCE(?, confidence),
         severity = COALESCE(?, severity),
         description = COALESCE(?, description),
         symptoms = COALESCE(?, symptoms),
         solutions = COALESCE(?, solutions),
         recommended_product_name = COALESCE(?, recommended_product_name),
         recommended_product_price = COALESCE(?, recommended_product_price),
         recommended_product_category = COALESCE(?, recommended_product_category)
       WHERE id = ?`,
      [
        crop_name || null, disease_name || null, scientific_name || null, confidence ? parseInt(confidence) : null,
        severity || null, description || null, symptoms ? JSON.stringify(symptoms) : null, solutions ? JSON.stringify(solutions) : null,
        recommended_product_name || null, recommended_product_price || null, recommended_product_category || null, req.params.id
      ]
    );
    const [updated] = await pool.execute('SELECT * FROM crop_diseases WHERE id = ?', [req.params.id]);
    res.json({
      ...updated[0],
      symptoms: typeof updated[0].symptoms === 'string' ? JSON.parse(updated[0].symptoms) : updated[0].symptoms,
      solutions: typeof updated[0].solutions === 'string' ? JSON.parse(updated[0].solutions) : updated[0].solutions
    });
  } catch (err) { next(err); }
});

// DELETE /api/admin/crop-diseases/:id
app.delete('/api/admin/crop-diseases/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM crop_diseases WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Crop disease record deleted' });
  } catch (err) { next(err); }
});

// GET /api/admin/weather-forecasts
app.get('/api/admin/weather-forecasts', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM weather_forecasts ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/admin/weather-forecasts
app.post('/api/admin/weather-forecasts', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { day_name, temp, condition_icon, is_alert, location, temp_celsius, condition_text } = req.body;
  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO weather_forecasts (id, day_name, temp, condition_icon, is_alert, location, temp_celsius, condition_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, day_name, temp, condition_icon, is_alert ? 1 : 0, location || 'Kumbakonam, Tamil Nadu', parseInt(temp_celsius || 32), condition_text || 'Sunny Interval']
    );
    const [created] = await pool.execute('SELECT * FROM weather_forecasts WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/weather-forecasts/:id
app.put('/api/admin/weather-forecasts/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { day_name, temp, condition_icon, is_alert, location, temp_celsius, condition_text } = req.body;
  try {
    await pool.execute(
      `UPDATE weather_forecasts SET
         day_name = COALESCE(?, day_name),
         temp = COALESCE(?, temp),
         condition_icon = COALESCE(?, condition_icon),
         is_alert = COALESCE(?, is_alert),
         location = COALESCE(?, location),
         temp_celsius = COALESCE(?, temp_celsius),
         condition_text = COALESCE(?, condition_text)
       WHERE id = ?`,
      [
        day_name || null, temp || null, condition_icon || null, is_alert !== undefined ? (is_alert ? 1 : 0) : null,
        location || null, temp_celsius ? parseInt(temp_celsius) : null, condition_text || null, req.params.id
      ]
    );
    const [updated] = await pool.execute('SELECT * FROM weather_forecasts WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/weather-forecasts/:id
app.delete('/api/admin/weather-forecasts/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM weather_forecasts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Weather forecast record deleted' });
  } catch (err) { next(err); }
});

// POST /api/admin/shops (admin creates a shop)
app.post('/api/admin/shops', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { ownerId, name, address, description, category, imageUrl, phone, license_number, plan } = req.body;
  try {
    const [user] = await pool.execute('SELECT uid FROM users WHERE uid = ? AND role = \'SHOP_OWNER\'', [ownerId]);
    if (user.length === 0) return res.status(400).json({ error: 'Valid Owner (SHOP_OWNER) is required' });

    const shopId = uuidv4();
    const finalImage = imageUrl || 'images/seeds_shop.png';

    await pool.execute(
      `INSERT INTO shops (id, ownerId, name, address, imageUrl, description, category, status, phone, license_number, plan, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?, 5.0)`,
      [shopId, ownerId, name, address || '', finalImage, description || '', category || 'General Store', phone || '', license_number || '', plan || 'FREE']
    );

    await pool.execute(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES (UUID(), ?, 'CREATE_SHOP', 'shops', ?, ?, ?)`,
      [req.user.id, shopId, JSON.stringify({ ownerId, name }), req.ip]
    );

    const [created] = await pool.execute('SELECT * FROM shops WHERE id = ?', [shopId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/shops/:id (admin updates any shop details)
app.put('/api/admin/shops/:id', verifyToken, requireRole('ADMIN'), async (req, res, next) => {
  const { name, address, description, category, imageUrl, status, phone, license_number, plan, documents_uploaded } = req.body;
  try {
    const [existing] = await pool.execute('SELECT * FROM shops WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Shop not found' });

    await pool.execute(
      `UPDATE shops SET
         name = COALESCE(?, name),
         address = COALESCE(?, address),
         description = COALESCE(?, description),
         category = COALESCE(?, category),
         imageUrl = COALESCE(?, imageUrl),
         status = COALESCE(?, status),
         phone = COALESCE(?, phone),
         license_number = COALESCE(?, license_number),
         plan = COALESCE(?, plan),
         documents_uploaded = COALESCE(?, documents_uploaded),
         updated_at = NOW()
       WHERE id = ?`,
      [
        name || null, address || null, description || null, category || null, imageUrl || null, status || null,
        phone || null, license_number || null, plan || null, documents_uploaded !== undefined ? (documents_uploaded ? 1 : 0) : null,
        req.params.id
      ]
    );

    await pool.execute(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES (UUID(), ?, 'UPDATE_SHOP_DETAILS', 'shops', ?, ?, ?)`,
      [req.user.id, req.params.id, JSON.stringify(req.body), req.ip]
    );

    const [updated] = await pool.execute('SELECT * FROM shops WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 AgriFarm v2.0 API started`, { port: PORT, env: process.env.NODE_ENV || 'development' });
  console.log(`\n🌱 AgriFarm v2.0 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Admin Portal:  http://localhost:5173`);
  console.log(`🔐 Security:      JWT + bcrypt + Rate Limiting + Helmet\n`);
});

module.exports = app;
