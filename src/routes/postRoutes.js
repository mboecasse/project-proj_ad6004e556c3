// File: src/routes/postRoutes.js
// Generated: 2025-10-16 14:45:54 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_zgfw1kf975gm


const express = require('express');

const { Validator } = require('../middleware/validator');

const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');


const router = express.Router();

// Validation rules


const postValidationRules = Validator.validatePost();


const idValidationRules = Validator.validateId();

/**
 * GET /posts
 * Fetch all posts
 */
router.get('/', getPosts);

/**
 * GET /posts/:id
 * Fetch post by ID
 */
router.get('/:id', idValidationRules, getPostById);

/**
 * POST /posts
 * Create new post
 */
router.post('/', postValidationRules, createPost);

/**
 * PUT /posts/:id
 * Update post
 */
router.put('/:id', idValidationRules, postValidationRules, updatePost);

/**
 * DELETE /posts/:id
 * Delete post
 */
router.delete('/:id', idValidationRules, deletePost);

module.exports = router;
