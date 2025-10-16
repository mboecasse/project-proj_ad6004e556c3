// File: src/app.js
// Generated: 2025-10-16 14:46:17 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_y58kllvlw3a3


const configureSecurityMiddleware = require('./middleware/security');


const cors = require('cors');


const express = require('express');


const helmet = require('helmet');


const logger = require('./utils/logger');


const morgan = require('morgan');


const routes = require('./routes/index');

const { apiLimiter } = require('./middleware/rateLimiter');

const { errorHandler } = require('./middleware/errorHandler');

// Import custom middleware and utilities

// Initialize Express app


const app = express();

/**
 * Security Middleware
 * Apply helmet, cors, sanitization, and other security measures
 */
app.use(helmet());

// CORS configuration


const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: corsOrigin === '*' ? false : corsOrigin,
  credentials: corsOrigin !== '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply additional security middleware (mongo-sanitize, hpp, etc.)
configureSecurityMiddleware(app);

/**
 * Rate Limiting
 * Apply rate limiter to all API routes and health endpoint
 */
app.use('/api', apiLimiter);
app.use('/health', apiLimiter);

/**
 * Body Parsers
 * Parse JSON and URL-encoded bodies with size limit
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * HTTP Request Logging
 * Use morgan with winston logger integration
 */


const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

/**
 * Health Check Endpoint
 * Returns server status and timestamp
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API Routes
 * Mount all application routes under /api prefix
 */
app.use('/api', routes);

/**
 * 404 Handler
 * Catch all undefined routes
 */
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

/**
 * Global Error Handler
 * Must be the last middleware - catches all errors
 */
app.use(errorHandler);

module.exports = app;
