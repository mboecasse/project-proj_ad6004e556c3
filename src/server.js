// File: src/server.js
// Generated: 2025-10-16 14:47:55 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_7a5iysh7aqud

    const mongoose = require('mongoose');


const app = require('./app');


const config = require('./config/env');


const logger = require('./utils/logger');

const { connectDB } = require('./config/database');


let server;

let isShuttingDown = false;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database first
    await connectDB();
    logger.info('Database connected successfully');

    // Start HTTP server
    server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  // Guard against multiple simultaneous shutdown attempts
  if (isShuttingDown) {
    logger.warn(`Shutdown already in progress, ignoring ${signal}`);
    return;
  }
  isShuttingDown = true;

  logger.info(`${signal} received, starting graceful shutdown`);

  // Set timeout for forced shutdown
  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  try {
    // Close HTTP server (stop accepting new connections)
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', { error: err.message });
            reject(err);
          } else {
            logger.info('HTTP server closed');
            resolve();
          }
        });
      });
    }

    // Close database connection
    await mongoose.connection.close();
    logger.info('Database connection closed');

    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  gracefulShutdown('unhandledRejection');
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  // Exit immediately without graceful shutdown due to corrupted state
  process.exit(1);
});

/**
 * Handle SIGTERM signal
 */
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

/**
 * Handle SIGINT signal (Ctrl+C)
 */
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

// Start the server
startServer();

module.exports = { startServer, gracefulShutdown };
