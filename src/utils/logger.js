// File: src/utils/logger.js
// Generated: 2025-10-16 14:37:23 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_d4wm6sd6mtqc


const fs = require('fs');


const path = require('path');


const winston = require('winston');

/**
 * Winston Logger Configuration
 *
 * Centralized logging utility for the entire application.
 * Provides environment-based configuration with appropriate transports and log levels.
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Information message');
 *   logger.error('Error message', { error: err.message });
 *   logger.debug('Debug message', { data: someData });
 *
 * Log Levels (in order of priority):
 *   - error: Error messages that need immediate attention
 *   - warn: Warning messages for potentially harmful situations
 *   - info: Informational messages about application state
 *   - http: HTTP request logging
 *   - debug: Detailed debugging information (development only)
 *
 * Environment Behavior:
 *   - Development: Console output with colorized logs, debug level
 *   - Production: Console + file outputs, info level
 *   - Test: Silent mode (no output)
 */


const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Ensure logs directory exists
 */


const ensureLogDirectory = () => {
  const logDir = path.resolve(process.cwd(), 'logs');

  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true, mode: 0o750 });
    } catch (error) {
      console.error('Failed to create logs directory:', error.message);
    }
  }
};

/**
 * Custom log format
 * Format: YYYY-MM-DD HH:mm:ss [LEVEL]: message
 */


const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }

  // Add stack trace for errors
  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

/**
 * Determine log level based on environment
 */


const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'test') {
    return 'silent';
  }

  if (env === 'production') {
    return 'info';
  }

  return 'debug';
};

/**
 * Configure transports based on environment
 */


const getTransports = () => {
  const env = process.env.NODE_ENV || 'development';
  const transports = [];

  // Test environment: no transports (silent)
  if (env === 'test') {
    return transports;
  }

  // Console transport for all environments
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      )
    })
  );

  // File transports for production
  if (env === 'production') {
    ensureLogDirectory();

    const logDir = path.resolve(process.cwd(), 'logs');
    const errorLogPath = path.join(logDir, 'error.log');
    const combinedLogPath = path.join(logDir, 'combined.log');

    // Error log file with rotation
    transports.push(
      new winston.transports.File({
        filename: errorLogPath,
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true,
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          logFormat
        )
      })
    );

    // Combined log file with rotation
    transports.push(
      new winston.transports.File({
        filename: combinedLogPath,
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true,
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          logFormat
        )
      })
    );
  }

  return transports;
};

/**
 * Create Winston logger instance
 */


const logger = winston.createLogger({
  level: getLogLevel(),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: getTransports(),
  exitOnError: false
});

/**
 * Stream object for Morgan HTTP logger integration
 * Allows Morgan to write to Winston logger
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
