// File: src/routes/index.js
// Generated: 2025-10-16 14:36:06 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_fhwy5xnrn2ny


const commentRoutes = require('./commentRoutes');


const express = require('express');


const healthRoutes = require('./healthRoutes');


const postRoutes = require('./postRoutes');


const router = express.Router();

// Import route modules

// Mount comment routes at /comments
router.use('/comments', commentRoutes);

// Mount health check routes at /health
router.use('/health', healthRoutes);

// Mount post routes at /posts
router.use('/posts', postRoutes);

module.exports = router;
