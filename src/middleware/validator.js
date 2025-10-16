// File: src/middleware/validator.js
// Generated: 2025-10-16 14:44:16 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_f3e5outzpbgy


const ApiResponse = require('../utils/apiResponse');

const { validationResult } = require('express-validator');

/**
 * Validation middleware wrapper
 * Checks express-validator results and returns formatted errors
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with validation errors or calls next()
 */


const Validator = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg
    }));

    try {
      const errorResponse = ApiResponse.error('Validation failed', formattedErrors);

      if (!errorResponse) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      return res.status(400).json(errorResponse);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
  }

  next();
};

module.exports = { Validator };
