// File: src/validators/commentValidator.js
// Generated: 2025-10-16 14:39:26 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_59q8u34h0w8y


const { body, param } = require('express-validator');

/**
 * Validation rules for creating a comment
 */


const createCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters'),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Author must be between 2 and 100 characters'),

  body('postId')
    .notEmpty()
    .withMessage('Post ID is required')
    .isMongoId()
    .withMessage('Invalid post ID format')
];

/**
 * Validation rules for updating a comment
 */


const updateCommentValidation = [
  body('content')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters'),

  body('author')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author must be between 2 and 100 characters')
];

/**
 * Validation for comment ID parameter
 */


const validateCommentId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID format')
];

/**
 * Validation for post ID parameter
 */


const validatePostId = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID format')
];

module.exports = {
  createCommentValidation,
  updateCommentValidation,
  validateCommentId,
  validatePostId
};
