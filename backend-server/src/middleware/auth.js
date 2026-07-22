// src/middleware/auth.js
// JWT verification middleware — attach req.user on every protected route

require('dotenv').config();
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const pool   = require('../config/database');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'agrifarm_access_secret_fallback';

/**
 * Verify JWT access token.
 * Expects:  Authorization: Bearer <token>
 * On success sets req.user = { id, email, role, name }
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    
    // Check blacklist
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await pool.execute('SELECT id FROM access_token_blacklist WHERE token_hash = ?', [tokenHash]);
    if (rows.length > 0) {
      return res.status(401).json({ error: 'Unauthorized: Token blacklisted' });
    }

    req.user = decoded;            // { id, email, role, name, iat, exp }
    next();
  } catch (err) {
    logger.warn('JWT verification failed', { error: err.message, ip: req.ip });
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please refresh your session.' });
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Optional auth — sets req.user if token present, but does NOT reject if missing.
 * Use on public routes that have personalized behaviour when logged in.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const [rows] = await pool.execute('SELECT id FROM access_token_blacklist WHERE token_hash = ?', [tokenHash]);
      if (rows.length === 0) {
        req.user = decoded;
      } else {
        req.user = null;
      }
    } catch (_) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { verifyToken, optionalAuth };
