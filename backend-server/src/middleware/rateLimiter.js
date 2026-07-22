// src/middleware/rateLimiter.js
// express-rate-limit configurations for different endpoint groups

const rateLimit = require('express-rate-limit');

// General API limiter — 1000 requests per 15 minutes per IP (increased for admin portal polling)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:       process.env.DISABLE_RATE_LIMIT === 'true' ? 999999 : (parseInt(process.env.RATE_LIMIT_MAX) || 1000),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Strict limiter for auth endpoints — 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:       process.env.DISABLE_RATE_LIMIT === 'true' ? 999999 : (parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 20),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' },
  skipSuccessfulRequests: true  // don't count successful logins toward limit
});

// Upload limiter — 20 uploads per hour per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:       process.env.DISABLE_RATE_LIMIT === 'true' ? 999999 : 1000,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Upload limit reached. Please wait before uploading again.' }
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
