// src/middleware/rbac.js
// Role-Based Access Control — restrict routes by user role

/**
 * Usage:
 *   router.delete('/users/:id', verifyToken, requireRole('ADMIN'), handler)
 *   router.post('/products',    verifyToken, requireRole('SHOP_OWNER','ADMIN'), handler)
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Not authenticated' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Forbidden: This action requires one of [${allowedRoles.join(', ')}] role`
    });
  }
  next();
};

module.exports = { requireRole };
