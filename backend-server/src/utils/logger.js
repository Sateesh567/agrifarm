// src/utils/logger.js
// Winston structured logger — replaces console.log in production

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'agrifarm-api' },
  transports: [
    // Write all logs to combined.log
    new transports.File({ filename: path.join(logsDir, 'combined.log'), maxsize: 10485760, maxFiles: 5 }),
    // Write error logs separately
    new transports.File({ filename: path.join(logsDir, 'error.log'),    level: 'error', maxsize: 10485760, maxFiles: 5 }),
  ]
});

// In development, also log to console with colours
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ level, message, timestamp, ...meta }) => {
        const extras = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `${timestamp} [${level}]: ${message}${extras}`;
      })
    )
  }));
}

module.exports = logger;
