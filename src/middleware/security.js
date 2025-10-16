// File: src/middleware/security.js
// Generated: 2025-10-16 14:44:35 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_x2anm9efu4at


const config = require('../config/env');


const cors = require('cors');


const helmet = require('helmet');


const hpp = require('hpp');


const mongoSanitize = require('express-mongo-sanitize');

/**
 * Configure security middleware for the Express application
 * Applies helmet for security headers, CORS configuration, MongoDB sanitization, and HPP protection
 *
 * @param {Object} app - Express application instance
 */


const configureSecurityMiddleware = (app) => {
  // Helmet - Set security HTTP headers
  app.use(
    helmet({
      // Disable crossOriginEmbedderPolicy for API compatibility
      crossOriginEmbedderPolicy: false,
      // Set cross-origin resource policy to allow cross-origin requests
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Basic Content Security Policy for API
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"]
        }
      }
    })
  );

  // CORS - Configure Cross-Origin Resource Sharing
  const allowedOrigins = config.cors.origin
    ? config.cors.origin.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin only in development (mobile apps, Postman, etc.)
        if (!origin && config.env or config.isDevelopment() === 'development') {
          return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // MongoDB Sanitization - Prevent NoSQL injection attacks
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        console.warn(`MongoDB sanitization applied on request to ${req.path}`, { key });
      }
    })
  );

  // HPP - Prevent HTTP Parameter Pollution
  app.use(
    hpp({
      whitelist: ['tags', 'categories']
    })
  );
};

module.exports = configureSecurityMiddleware;
