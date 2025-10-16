// File: jest.config.js
// Generated: 2025-10-16 14:42:45 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_nn5qewshdung

module.exports = {
  // ============================================================================
  // TEST ENVIRONMENT CONFIGURATION
  // ============================================================================

  /**
   * Test environment for Node.js applications
   * Uses node environment instead of jsdom for backend testing
   */
  testEnvironment: 'node',

  /**
   * Detect and report open handles that prevent Jest from exiting cleanly
   * Useful for identifying database connections or timers that weren't closed
   */
  detectOpenHandles: true,

  /**
   * Global timeout for all tests (10 seconds)
   * Increased from default 5s to accommodate database operations
   */
  testTimeout: 10000,

  // ============================================================================
  // TEST FILE PATTERNS
  // ============================================================================

  /**
   * Patterns to match test files
   * Supports multiple naming conventions: *.test.js, *.spec.js, __tests__/*.js
   */
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],

  /**
   * Directories and files to ignore during test discovery
   * Excludes dependencies, build artifacts, and coverage reports
   */
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // ============================================================================
  // COVERAGE CONFIGURATION
  // ============================================================================

  /**
   * Files to collect coverage from
   * Includes all source files but excludes configuration and test files
   */
  collectCoverageFrom: [
    'src/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],

  /**
   * Coverage thresholds - tests fail if coverage drops below these values
   * Set to production-ready standards for blog API
   */
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },

  /**
   * Coverage report formats
   * - text: Console output during test runs
   * - lcov: Standard format for CI/CD tools
   * - html: Human-readable HTML report
   * - json-summary: Machine-readable summary for badges
   */
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  /**
   * Directory where coverage reports are written
   */
  coverageDirectory: 'coverage',

  // ============================================================================
  // SETUP AND TEARDOWN FILES
  // ============================================================================

  /**
   * Setup file that runs after test environment is initialized
   * Used for global test utilities, custom matchers, and environment setup
   */
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],

  /**
   * Global setup script that runs once before all test suites
   * Used to start MongoDB memory server and initialize test database
   */
  globalSetup: '<rootDir>/tests/globalSetup.js',

  /**
   * Global teardown script that runs once after all test suites
   * Used to stop MongoDB memory server and cleanup resources
   */
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // ============================================================================
  // MODULE TRANSFORMATION AND MAPPING
  // ============================================================================

  /**
   * Transform configuration for ES6+ JavaScript files
   * Uses babel-jest to transpile modern JavaScript syntax
   */
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  /**
   * Module name mapper for path aliases
   * Allows cleaner imports using @ prefixes instead of relative paths
   * Example: import User from '@models/User' instead of '../../../models/User'
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@validators/(.*)$': '<rootDir>/src/validators/$1'
  },

  // ============================================================================
  // MOCK CONFIGURATION
  // ============================================================================

  /**
   * Automatically clear mock calls and instances between every test
   * Prevents test pollution from mock state
   */
  clearMocks: true,

  /**
   * Reset mock state between every test
   * Clears mock implementation and return values
   */
  resetMocks: true,

  /**
   * Restore original implementations after each test
   * Ensures mocked functions return to their original behavior
   */
  restoreMocks: true,

  // ============================================================================
  // ADDITIONAL CONFIGURATION
  // ============================================================================

  /**
   * Display individual test results with test suite hierarchy
   */
  verbose: true,

  /**
   * Maximum number of concurrent workers
   * Set to 50% of available CPUs for optimal performance
   */
  maxWorkers: '50%',

  /**
   * Indicates whether each individual test should be reported during the run
   */
  notify: false,

  /**
   * Reset module registry between every test
   * Ensures proper test isolation and makes open handle detection more effective
   */
  resetModules: true,

  /**
   * Paths to modules that run code to configure or set up the testing framework
   * before each test file in the suite is executed
   */
  moduleFileExtensions: [
    'js',
    'json',
    'node'
  ],

  /**
   * Ignore transformation for node_modules except specific packages
   * Speeds up test execution by skipping unnecessary transformations
   */
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|babel-jest)/)'
  ]
};
