// File: src/controllers/postController.js
// Generated: 2025-10-16 14:44:51 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_fkyfn0dvoltf


const ApiResponse = require('../utils/apiResponse');


const Comment = require('../models/Comment');


const Post = require('../models/Post');


const logger = require('../utils/logger');

/**
 * Sanitize string for regex to prevent NoSQL injection
 */


const sanitizeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Get all posts with pagination and filtering
 */


const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.author) {
      const sanitizedAuthor = sanitizeRegex(req.query.author);
      filter.author = { $regex: sanitizedAuthor, $options: 'i' };
    }
    if (req.query.search) {
      const sanitizedSearch = sanitizeRegex(req.query.search);
      filter.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { content: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(filter);

    logger.info('Fetched posts', {
      count: posts.length,
      page,
      limit,
      total,
      filter
    });

    return ApiResponse.success(res, {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Posts retrieved successfully');
  } catch (error) {
    logger.error('Error in getPosts:', { error: error.message, stack: error.stack });
    return ApiResponse.error(res, 'Failed to fetch posts', 500);
  }
};

/**
 * Get post by ID
 */


const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).lean();

    if (!post) {
      logger.warn('Post not found', { postId: id });
      return ApiResponse.error(res, 'Post not found', 404);
    }

    logger.info('Fetched post by ID', { postId: id });

    return ApiResponse.success(res, post, 'Post retrieved successfully');
  } catch (error) {
    if (error.name === 'CastError') {
      logger.warn('Invalid post ID format', { postId: req.params.id });
      return ApiResponse.error(res, 'Invalid post ID format', 400);
    }
    logger.error('Error in getPostById:', {
      postId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 'Failed to fetch post', 500);
  }
};

/**
 * Create new post
 */


const createPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    // Validate required fields
    if (!title || !content || !author) {
      logger.warn('Missing required fields for post creation', {
        hasTitle: !!title,
        hasContent: !!content,
        hasAuthor: !!author
      });
      return ApiResponse.error(res, 'Title, content, and author are required', 400);
    }

    // Validate field types
    if (typeof title !== 'string' || typeof content !== 'string' || typeof author !== 'string') {
      logger.warn('Invalid field types for post creation');
      return ApiResponse.error(res, 'Title, content, and author must be strings', 400);
    }

    // Validate field lengths
    if (title.trim().length === 0 || content.trim().length === 0 || author.trim().length === 0) {
      logger.warn('Empty fields provided for post creation');
      return ApiResponse.error(res, 'Title, content, and author cannot be empty', 400);
    }

    // Create post
    const post = await Post.create({
      title,
      content,
      author
    });

    logger.info('Created new post', {
      postId: post._id,
      title: post.title,
      author: post.author
    });

    return ApiResponse.success(res, post, 'Post created successfully', 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.warn('Post validation failed', { error: error.message });
      return ApiResponse.error(res, error.message, 400);
    }
    logger.error('Error in createPost:', {
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 'Failed to create post', 500);
  }
};

/**
 * Update post
 */


const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (author !== undefined) updates.author = author;

    if (Object.keys(updates).length === 0) {
      logger.warn('No fields to update', { postId: id });
      return ApiResponse.error(res, 'No fields to update', 400);
    }

    const post = await Post.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!post) {
      logger.warn('Post not found for update', { postId: id });
      return ApiResponse.error(res, 'Post not found', 404);
    }

    logger.info('Updated post', {
      postId: id,
      updatedFields: Object.keys(updates)
    });

    return ApiResponse.success(res, post, 'Post updated successfully');
  } catch (error) {
    if (error.name === 'CastError') {
      logger.warn('Invalid post ID format', { postId: req.params.id });
      return ApiResponse.error(res, 'Invalid post ID format', 400);
    }
    if (error.name === 'ValidationError') {
      logger.warn('Post validation failed', { error: error.message });
      return ApiResponse.error(res, error.message, 400);
    }
    logger.error('Error in updatePost:', {
      postId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 'Failed to update post', 500);
  }
};

/**
 * Delete post and cascade delete associated comments
 */


const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete post (pre-remove hook will handle comment deletion)
    const post = await Post.findById(id);

    if (!post) {
      logger.warn('Post not found for deletion', { postId: id });
      return ApiResponse.error(res, 'Post not found', 404);
    }

    // Delete associated comments
    const deletedComments = await Comment.deleteMany({ postId: id });

    // Delete the post
    await post.deleteOne();

    logger.info('Deleted post and associated comments', {
      postId: id,
      deletedCommentsCount: deletedComments.deletedCount
    });

    return ApiResponse.success(
      res,
      {
        postId: id,
        deletedCommentsCount: deletedComments.deletedCount
      },
      'Post and associated comments deleted successfully'
    );
  } catch (error) {
    if (error.name === 'CastError') {
      logger.warn('Invalid post ID format', { postId: req.params.id });
      return ApiResponse.error(res, 'Invalid post ID format', 400);
    }
    logger.error('Error in deletePost:', {
      postId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 'Failed to delete post', 500);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
