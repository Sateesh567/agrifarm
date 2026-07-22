// src/middleware/errorHandler.js
// Global error handler — standardizes all error responses

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log with full stack trace
  logger.error('Unhandled error', {
    message:   err.message,
    stack:     err.stack,
    method:    req.method,
    url:       req.originalUrl,
    userId:    req.user?.id,
    ip:        req.ip
  });

  // Validation errors from express-validator (array)
  if (err.type === 'validation') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'A record with this value already exists' });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referenced resource does not exist' });
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request payload too large. Maximum allowed is 10MB.' });
  }

  // Generic fallback
  const status  = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred'
    : err.message;

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
