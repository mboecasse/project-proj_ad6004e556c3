// File: src/controllers/commentController.js
// Generated: 2025-10-16 14:42:51 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_em3h0g1yycvt


const ApiResponse = require('../utils/apiResponse');


const Comment = require('../models/Comment');


const Post = require('../models/Post');


const logger = require('../utils/logger');

/**
 * Validate comment input
 */


const validateCommentInput = (content, author) => {
  const errors = [];

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (content && content.trim().length > 10000) {
    errors.push('Content must not exceed 10000 characters');
  }

  if (!author || typeof author !== 'string' || author.trim().length === 0) {
    errors.push('Author is required and must be a non-empty string');
  }

  if (author && author.trim().length > 200) {
    errors.push('Author name must not exceed 200 characters');
  }

  // Basic XSS prevention - check for script tags
  const dangerousPattern = /<script|javascript:|onerror=|onload=/i;
  if (content && dangerousPattern.test(content)) {
    errors.push('Content contains potentially malicious code');
  }

  if (author && dangerousPattern.test(author)) {
    errors.push('Author name contains potentially malicious code');
  }

  return errors;
};

/**
 * Check if user is authorized to modify comment
 */


const isAuthorized = (comment, userId, userRole) => {
  // Allow if user is the author or has admin/moderator role
  return comment.author === userId ||
         userRole === 'admin' ||
         userRole === 'moderator';
};

/**
 * Get all comments for a specific post
 * @route GET /api/posts/:postId/comments
 */


const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { limit = 50, sort = '-createdAt' } = req.query;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      logger.warn('Attempted to fetch comments for non-existent post', { postId });
      return ApiResponse.notFound(res, 'Post not found');
    }

    // Fetch comments using model's static method
    const comments = await Comment.findByPostId(postId, {
      limit: parseInt(limit),
      sort
    });

    const count = await Comment.countByPostId(postId);

    logger.info('Fetched comments for post', { postId, count: comments.length });

    return ApiResponse.success(res, {
      comments,
      total: count,
      postId
    }, 'Comments retrieved successfully');
  } catch (error) {
    logger.error('Failed to fetch comments', {
      postId: req.params.postId,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Get single comment by ID
 * @route GET /api/comments/:id
 */


const getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment || comment.isDeleted) {
      logger.warn('Attempted to fetch non-existent or deleted comment', { commentId: id });
      return ApiResponse.notFound(res, 'Comment not found');
    }

    logger.info('Fetched comment by ID', { commentId: id });

    return ApiResponse.success(res, comment, 'Comment retrieved successfully');
  } catch (error) {
    logger.error('Failed to fetch comment', {
      commentId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Create new comment
 * @route POST /api/posts/:postId/comments
 */


const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, author } = req.body;

    // Validate input
    const validationErrors = validateCommentInput(content, author);
    if (validationErrors.length > 0) {
      logger.warn('Comment creation failed - validation errors', {
        postId,
        errors: validationErrors
      });
      return ApiResponse.badRequest(res, validationErrors.join(', '));
    }

    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
      logger.warn('Attempted to create comment for non-existent post', { postId });
      return ApiResponse.notFound(res, 'Post not found');
    }

    // Create comment with sanitized input
    const comment = await Comment.create({
      content: content.trim(),
      author: author.trim(),
      postId
    });

    logger.info('Created new comment', {
      commentId: comment._id,
      postId,
      author: author.trim()
    });

    return ApiResponse.created(res, comment, 'Comment created successfully');
  } catch (error) {
    logger.error('Failed to create comment', {
      postId: req.params.postId,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Update comment
 * @route PUT /api/comments/:id
 */


const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    // Find comment
    const comment = await Comment.findById(id);

    if (!comment || comment.isDeleted) {
      logger.warn('Attempted to update non-existent or deleted comment', { commentId: id });
      return ApiResponse.notFound(res, 'Comment not found');
    }

    // Authorization check
    const userId = req.user?.id || req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !isAuthorized(comment, userId.toString(), userRole)) {
      logger.warn('Unauthorized comment update attempt', {
        commentId: id,
        userId,
        commentAuthor: comment.author
      });
      return ApiResponse.forbidden(res, 'You are not authorized to update this comment');
    }

    // Validate input
    const validationErrors = validateCommentInput(
      content !== undefined ? content : comment.content,
      author !== undefined ? author : comment.author
    );

    if (validationErrors.length > 0) {
      logger.warn('Comment update failed - validation errors', {
        commentId: id,
        errors: validationErrors
      });
      return ApiResponse.badRequest(res, validationErrors.join(', '));
    }

    // Update fields
    if (content !== undefined) {
      comment.content = content.trim();
    }
    if (author !== undefined) {
      comment.author = author.trim();
    }

    await comment.save();

    logger.info('Updated comment', { commentId: id, userId });

    return ApiResponse.success(res, comment, 'Comment updated successfully');
  } catch (error) {
    logger.error('Failed to update comment', {
      commentId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Delete comment (soft delete)
 * @route DELETE /api/comments/:id
 */


const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment || comment.isDeleted) {
      logger.warn('Attempted to delete non-existent or already deleted comment', { commentId: id });
      return ApiResponse.notFound(res, 'Comment not found');
    }

    // Authorization check
    const userId = req.user?.id || req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !isAuthorized(comment, userId.toString(), userRole)) {
      logger.warn('Unauthorized comment deletion attempt', {
        commentId: id,
        userId,
        commentAuthor: comment.author
      });
      return ApiResponse.forbidden(res, 'You are not authorized to delete this comment');
    }

    // Soft delete using model method
    await comment.softDelete();

    logger.info('Deleted comment', { commentId: id, userId });

    return ApiResponse.success(res, null, 'Comment deleted successfully');
  } catch (error) {
    logger.error('Failed to delete comment', {
      commentId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

module.exports = {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
};
