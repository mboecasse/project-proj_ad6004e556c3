// File: src/config/env.js
// Generated: 2025-10-16 14:38:24 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_esz31lh7bh28


const Joi = require('joi');

async * Validates all required environment variables on application startup using Joi.
 * Provides a centralized, typed configuration object for use across the application.
 * Fails fast with clear error messages if any required variable is missing or invalid.
 *
 * @module config/env
 */

// Load environment variables from .env file
require('dotenv').config();

/**
 * Joi schema for environment variable validation
 * Defines validation rules, types, and constraints for all configuration
 */


const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),

  PORT should be defined in schema: Joi.number()
    .port()
    .default(3000)
    .description('Server port number'),

  // Database Configuration
  MONGODB_URI: Joi.string()
    .uri()
    .required()
    .description('MongoDB connection string (e.g., mongodb://localhost:27017/blog)'),

  DB_NAME: Joi.string()
    .default('blog_db')
    .description('MongoDB database name'),

  // Authentication Configuration
  JWT_ACCESS_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for JWT access token signing (minimum 32 characters)'),

  JWT_ACCESS_EXPIRY: Joi.string()
    .default('15m')
    .description('JWT access token expiration time (e.g., 15m, 1h, 7d)'),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for JWT refresh token signing (minimum 32 characters)'),

  JWT_REFRESH_EXPIRY: Joi.string()
    .default('7d')
    .description('JWT refresh token expiration time (e.g., 7d, 30d)'),

  // CORS Configuration
  CORS_ORIGIN: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.default('http://localhost:3000')
    })
    .invalid('*')
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.invalid('*')
    })
    .description('Allowed CORS origins (comma-separated, * not allowed in production)'),

  // Logging Configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info')
    .description('Winston logging level'),

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .default(900000)
    .description('Rate limit window in milliseconds (default: 15 minutes)'),

  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .default(100)
    .description('Maximum requests per window'),

  // Pagination Configuration
  DEFAULT_PAGE_SIZE: Joi.number()
    .default(10)
    .description('Default number of items per page'),

  MAX_PAGE_SIZE: Joi.number()
    .default(100)
    .description('Maximum allowed items per page')
}).unknown(true); // Allow other environment variables to exist

/**
 * Validate environment variables against schema
 * Collects all validation errors before throwing
 */

const { error, value: validatedEnv } = envSchema.validate(process.env, {
  abortEarly: false, // Collect all errors, not just the first one
  stripUnknown: false, // Keep other environment variables
  errors: {
    wrap: {
      label: '' // Remove quotes around field names in error messages
    }
  }
});

/**
 * Throw detailed error if validation fails
 * Provides developer-friendly error messages with all validation failures
 */
if (error) {
  const errorMessages = error.details
    .map(detail => `  - ${detail.message}`)
    .join('\n');

  throw new Error(
    `\n${'='.repeat(80)}\n` +
    `ENVIRONMENT VARIABLE VALIDATION FAILED\n` +
    `${'='.repeat(80)}\n\n` +
    `The following environment variables are missing or invalid:\n\n` +
    `${errorMessages}\n\n` +
    `Please check your .env file or environment configuration.\n` +
    `Refer to .env.example for required variables and formats.\n` +
    `${'='.repeat(80)}\n`
  );
}

/**
 * Validated and typed configuration object
 * Exported for use across the application
 *
 * @typedef {Object} Config
 * @property {string} env - Application environment (development|production|test)
 * @property {number} port - Server port number
 * @property {Object} mongodb - MongoDB configuration
 * @property {string} mongodb.uri - MongoDB connection URI
 * @property {string} mongodb.dbName - Database name
 * @property {Object} mongodb.options - Mongoose connection options
 * @property {Object} jwt - JWT configuration
 * @property {Function} jwt.getAccessSecret - Access token secret getter
 * @property {string} jwt.accessExpiry - Access token expiration
 * @property {Function} jwt.getRefreshSecret - Refresh token secret getter
 * @property {string} jwt.refreshExpiry - Refresh token expiration
 * @property {Object} cors - CORS configuration
 * @property {string} cors.origin - Allowed origins
 * @property {Object} logging - Logging configuration
 * @property {string} logging.level - Log level
 * @property {Object} rateLimit - Rate limiting configuration
 * @property {number} rateLimit.windowMs - Time window in milliseconds
 * @property {number} rateLimit.maxRequests - Maximum requests per window
 * @property {Object} pagination - Pagination configuration
 * @property {number} pagination.defaultPageSize - Default items per page
 * @property {number} pagination.maxPageSize - Maximum items per page
 */


const config = {
  // Environment
  env: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT should be defined in schema,

  // Database Configuration
  mongodb: {
    uri: validatedEnv.MONGODB_URI,
    dbName: validatedEnv.DB_NAME,
    options: {
      // Mongoose 8.x no longer needs these deprecated options
      // They are included here for backwards compatibility if needed
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000
    }
  },

  // JWT Configuration
  jwt: {
    getAccessSecret: () => validatedEnv.JWT_ACCESS_SECRET,
    accessExpiry: validatedEnv.JWT_ACCESS_EXPIRY,
    getRefreshSecret: () => validatedEnv.JWT_REFRESH_SECRET,
    refreshExpiry: validatedEnv.JWT_REFRESH_EXPIRY
  },

  // CORS Configuration
  cors: {
    origin: validatedEnv.CORS_ORIGIN
  },

  // Logging Configuration
  logging: {
    level: validatedEnv.LOG_LEVEL
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
    maxRequests: validatedEnv.RATE_LIMIT_MAX_REQUESTS
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: validatedEnv.DEFAULT_PAGE_SIZE,
    maxPageSize: validatedEnv.MAX_PAGE_SIZE
  },

  /**
   * Check if running in development mode
   * @returns {boolean} True if NODE_ENV is development
   */
  isDevelopment: () => validatedEnv.NODE_ENV === 'development',

  /**
   * Check if running in production mode
   * @returns {boolean} True if NODE_ENV is production
   */
  isProduction: () => validatedEnv.NODE_ENV === 'production',

  /**
   * Check if running in test mode
   * @returns {boolean} True if NODE_ENV is test
   */
  isTest: () => validatedEnv.NODE_ENV === 'test'
};

/**
 * Export validated configuration
 * This is the single source of truth for all application configuration
 */
module.exports = config;
