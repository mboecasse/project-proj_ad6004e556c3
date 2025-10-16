// File: src/routes/commentRoutes.js
// Generated: 2025-10-16 14:46:08 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_f4jfxpankp80


const express = require('express');

const { Validator } = require('../middleware/validator');

const { authenticate } = require('../middleware/auth');

const { getComments, getCommentById, createComment, updateComment, deleteComment } = require('../controllers/commentController');

const { rateLimit } = require('express-rate-limit');


const router = express.Router();


const commentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many comments created, please try again later'
});

/**
 * GET /posts/:postId/comments
 * Get all comments for a post
 */
router.get('/posts/:postId/comments', getComments);

/**
 * GET /comments/:id
 * Get comment by ID
 */
router.get('/comments/:id', getCommentById);

/**
 * POST /posts/:postId/comments
 * Create new comment for a post
 */
router.post('/posts/:postId/comments', authenticate, commentRateLimiter, Validator.validateComment(), createComment);

/**
 * PUT /comments/:id
 * Update comment
 */
router.put('/comments/:id', authenticate, Validator.validateComment(), updateComment);

/**
 * DELETE /comments/:id
 * Delete comment
 */
router.delete('/comments/:id', authenticate, deleteComment);

module.exports = router;
