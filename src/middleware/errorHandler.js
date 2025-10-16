// File: src/middleware/errorHandler.js
// Generated: 2025-10-16 14:44:22 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_f7ngtp89638l


const ApiResponse = require('../utils/apiResponse');


const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Catches all errors, logs them, and returns formatted responses
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const errorHandler = (err, req, res, next) => {
  let error = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code
  };

  // Log error with context
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.userId || 'unauthenticated'
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    logger.warn('Validation error', { errors });

    return res.status(400).json(
      ApiResponse.error('Validation failed', errors)
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}`;

    logger.warn('Cast error', { path: err.path });

    return res.status(400).json(
      ApiResponse.error(message)
    );
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate value for field: ${field}`;

    logger.warn('Duplicate key error', { field });

    return res.status(409).json(
      ApiResponse.error(message, { field })
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('Invalid token', { message: err.message });

    return res.status(401).json(
      ApiResponse.error('Invalid token. Please log in again.')
    );
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('Token expired', { expiredAt: err.expiredAt });

    return res.status(401).json(
      ApiResponse.error('Token expired. Please log in again.')
    );
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Don't expose stack trace in production
  const responseData = process.env.NODE_ENV === 'development'
    ? { stack: error.stack }
    : undefined;

  res.status(statusCode).json(
    ApiResponse.error(message, responseData)
  );
};

module.exports = { errorHandler };
