// File: src/validators/postValidator.js
// Generated: 2025-10-16 14:38:04 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_3bg9cvlscmwa


const { body } = require('express-validator');

/**
 * Validation rules for creating a new post
 * Validates title, content, and author fields
 */


const validateCreatePost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .escape(),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string')
    .isLength({ min: 10, max: 100000 })
    .withMessage('Content must be between 10 and 100000 characters')
    .escape(),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isString()
    .withMessage('Author must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Author must be between 3 and 100 characters')
    .escape()
];

/**
 * Validation rules for updating an existing post
 * All fields are optional but must meet criteria if provided
 */


const validateUpdatePost = [
  body('title')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .escape(),

  body('content')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .withMessage('Content must be a string')
    .isLength({ min: 10, max: 100000 })
    .withMessage('Content must be between 10 and 100000 characters')
    .escape(),

  body('author')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .withMessage('Author must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Author must be between 3 and 100 characters')
    .escape()
];

module.exports = {
  validateCreatePost,
  validateUpdatePost
};
