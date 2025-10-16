// File: src/routes/healthRoutes.js
// Generated: 2025-10-16 14:40:33 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_ir9wlat7ihqy


const express = require('express');


const logger = require('../utils/logger');


const mongoose = require('../config/database');


const router = express.Router();

/**
 * GET /health
 * Health check endpoint
 * Returns API status and database connection status
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();

  try {
    // Check database connection with null/undefined safety
    let dbState;
    let isHealthy = false;

    if (mongoose && mongoose.connection && typeof mongoose.connection.readyState !== 'undefined') {
      dbState = mongoose.connection.readyState;
      isHealthy = dbState === 1;
    } else {
      dbState = 0;
      isHealthy = false;
    }

    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const status = isHealthy ? 'healthy' : 'unhealthy';

    const healthCheck = {
      success: true,
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      database: {
        status: dbStatus[dbState] || 'unknown',
        connected: isHealthy
      }
    };

    const statusCode = isHealthy ? 200 : 503;

    logger.info('Health check performed', {
      status,
      dbStatus: dbStatus[dbState],
      responseTime: healthCheck.responseTime
    });

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: Date.now() - startTime
    });
  }
});

module.exports = router;
