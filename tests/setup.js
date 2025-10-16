// File: tests/setup.js
// Generated: 2025-10-16 14:40:57 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_v9fg943qdhki


const mongoose = require('mongoose');

const { MongoMemoryServer } = require('mongodb-memory-server');


let mongoServer;

/**
 * Global setup before all tests
 * Initializes MongoDB Memory Server and establishes connection
 */
beforeAll(async () => {
  try {
    // Create MongoDB Memory Server instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB Memory Server connected for testing');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

/**
 * Clean up after each test
 * Removes all documents from all collections
 */
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clean up test database:', error);
    throw error;
  }
});

/**
 * Global teardown after all tests
 * Closes database connection and stops MongoDB Memory Server
 */
afterAll(async () => {
  try {
    // Close mongoose connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('MongoDB Memory Server disconnected');
  } catch (error) {
    console.error('Failed to teardown test database:', error);
    throw error;
  }
});

/**
 * Set test timeout
 * Increase timeout for database operations
 */
jest.setTimeout(30000);

module.exports = {};
