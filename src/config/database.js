// File: src/config/database.js
// Generated: 2025-10-16 14:37:21 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_lnl2d3pwqfzf


const config = require('./env');


const logger = require('../utils/logger');


const mongoose = require('mongoose');

async * All files must import mongoose from this file - NEVER create direct connections elsewhere.
 *
 * @module config/database
 */

/**
 * MongoDB connection options
 * Optimized for production with connection pooling and timeouts
 */


const options = {
  maxPoolSize: 10,              // Maximum number of connections in pool
  minPoolSize: 5,               // Minimum number of connections in pool
  serverSelectionTimeoutMS: 30000,  // Timeout for server selection (30s)
  socketTimeoutMS: 45000,       // Socket timeout (45s)
  family: 4,                    // Use IPv4, skip trying IPv6
  retryWrites: true,            // Retry failed writes
  w: 'majority'                 // Write concern
};

/**
 * Connect to MongoDB with retry logic
 *
 * Attempts to connect to MongoDB with exponential backoff retry strategy.
 * Logs all connection attempts and failures for monitoring.
 *
 * @param {number} retries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay between retries in ms (default: 5000)
 * @returns {Promise<void>}
 * @throws {Error} If connection fails after all retry attempts
 */


const connectDB = async (retries = 3, initialDelay = 5000) => {
  const MONGODB_URI = config.mongodb.uri;

  // Validate MongoDB URI
  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI is not defined in environment variables');
    logger.error('Database configuration error', { error: error.message });
    throw error;
  }

  // Mask credentials in URI for logging
  const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//*****:*****@');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info('Attempting to connect to MongoDB', {
        attempt,
        maxRetries: retries,
        uri: maskedUri
      });

      await mongoose.connect(MONGODB_URI, options);

      // Connection successful
      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        poolSize: options.maxPoolSize
      });

      return; // Exit function on success

    } catch (error) {
      logger.error('MongoDB connection attempt failed', {
        attempt,
        maxRetries: retries,
        error: error.message,
        code: error.code
      });

      // Don't retry on authentication failures
      if (error.message.includes('Authentication failed') || error.code === 18) {
        logger.error('Authentication failure - not retrying', { error: error.message });
        throw error;
      }

      // Don't retry on invalid URI
      if (error.message.includes('Invalid connection string')) {
        logger.error('Invalid MongoDB URI - not retrying', { error: error.message });
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === retries) {
        logger.error('All MongoDB connection attempts exhausted', {
          totalAttempts: retries,
          finalError: error.message
        });
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${error.message}`);
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * attempt;
      logger.warn('Retrying MongoDB connection', {
        nextAttempt: attempt + 1,
        delayMs: delay
      });

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Event: MongoDB connection established
 */
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB', {
    host: mongoose.connection.host,
    database: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  });
});

/**
 * Event: MongoDB connection error
 * Logs error but doesn't crash the application
 */
mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', {
    error: err.message,
    code: err.code,
    readyState: mongoose.connection.readyState
  });
});

/**
 * Event: MongoDB disconnected
 * Mongoose will automatically attempt to reconnect
 */
mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB', {
    readyState: mongoose.connection.readyState
  });
});

/**
 * Event: MongoDB reconnected
 */
mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected to MongoDB', {
    host: mongoose.connection.host,
    database: mongoose.connection.name
  });
});

/**
 * Event: MongoDB reconnect failed
 */
mongoose.connection.on('reconnectFailed', () => {
  logger.error('Mongoose reconnection failed - all attempts exhausted');
});

/**
 * Graceful shutdown handler for SIGINT (Ctrl+C)
 */
process.on('SIGINT', async () => {
  try {
    logger.info('SIGINT received - closing MongoDB connection gracefully');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
});

/**
 * Graceful shutdown handler for SIGTERM (deployment/container shutdown)
 */
process.on('SIGTERM', async () => {
  try {
    logger.info('SIGTERM received - closing MongoDB connection gracefully');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
});

/**
 * Log connection pool statistics in development mode
 */
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (mongoose.connection.readyState === 1) {
      logger.debug('MongoDB connection pool stats', {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        database: mongoose.connection.name
      });
    }
  }, 60000); // Log every 60 seconds
}

/**
 * Export mongoose instance and connection function
 * All models should import mongoose from this file
 */
module.exports = {
  connectDB,
  mongoose,
  connection: mongoose.connection
};
