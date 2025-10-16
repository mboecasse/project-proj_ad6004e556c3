// File: src/middleware/rateLimiter.js
// Generated: 2025-10-16 14:44:49 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_g8f53bpanf6y


const RedisStore = require('rate-limit-redis');


const config = require('../config/env');


const rateLimit = require('express-rate-limit');


const redis = require('redis');

// Create Redis client for rate limiting store


const redisClient = redis.createClient({
  host: Redis configuration not defined in config || 'localhost',
  port: config.redis?.port || 6379,
  password: config.redis?.password,
  db: config.redis?.rateLimitDb || 1,
  enable_offline_queue: false
});

redisClient.on('error', (err) => {
  console.error('Redis rate limit store error:', err);
});

// Key generator that properly handles proxies and X-Forwarded-For


const keyGenerator = (req) => {
  // Trust X-Forwarded-For header if behind proxy
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Get the first IP in the chain (original client)
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0];
  }
  // Fallback to direct connection IP
  return req.ip || req.connection.remoteAddress;
};

// Create Redis store instance


const createStore = () => {
  return new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  });
};

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes
 * Applied to: All general API routes
 */


const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.maxRequests || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createStore(),
  keyGenerator: keyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later'
    });
  }
});

/**
 * Authentication rate limiter
 * Limits: 10 failed + 20 successful requests per 15 minutes
 * Applied to: Login and registration routes
 * Counts both successful and failed attempts to prevent credential stuffing
 */


const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimiting?.authMaxRequests || 30, // Total limit for all auth attempts
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests to prevent credential stuffing
  store: createStore(),
  keyGenerator: keyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later'
    });
  }
});

/**
 * Failed authentication rate limiter
 * Limits: 5 failed attempts per 15 minutes
 * Applied to: Login routes for failed attempts only
 * Stricter limit for failed login attempts
 */


const authFailedLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimiting?.authFailedMaxRequests || 5, // Limit failed attempts
  message: {
    success: false,
    error: 'Too many failed authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  store: createStore(),
  keyGenerator: keyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many failed authentication attempts, please try again later'
    });
  }
});

/**
 * Create/Modify rate limiter
 * Limits: 20 requests per 15 minutes
 * Applied to: POST, PUT, DELETE operations
 * Protects against spam and abuse
 */


const createLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimiting?.createMaxRequests || 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: 'Too many create/update requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  keyGenerator: keyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many create/update requests, please try again later'
    });
  }
});

/**
 * API rate limiter (alias for generalLimiter)
 * Provides consistent naming across the application
 */


const apiLimiter = generalLimiter;

/**
 * RateLimiter class wrapper for all rate limiters
 */
class RateLimiter {
  static general = generalLimiter;
  static auth = authLimiter;
  static authFailed = authFailedLimiter;
  static create = createLimiter;
  static api = apiLimiter;
}

module.exports = {
  RateLimiter,
  generalLimiter,
  authLimiter,
  authFailedLimiter,
  createLimiter,
  apiLimiter
};
