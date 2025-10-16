// File: src/models/Comment.js
// Generated: 2025-10-16 14:38:10 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_xxec7zm2o549


const mongoose = require('mongoose');


const validator = require('validator');

/**
 * Comment Schema
 * Represents a comment on a blog post
 */


const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required'],
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Indexes for performance optimization
 */
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ postId: 1, isDeleted: 1 });
CommentSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware
 * Sanitize content before saving
 */
CommentSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.content = validator.escape(this.content.trim());
  }
  if (this.isModified('author')) {
    this.author = validator.escape(this.author.trim());
  }
  next();
});

/**
 * Query middleware to exclude soft-deleted comments by default
 */
CommentSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

/**
 * Instance method to soft delete a comment
 */
CommentSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

/**
 * Static method to get comments by post ID
 */
CommentSchema.statics.findByPostId = function (postId, options = {}) {
  // Validate postId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error('Invalid post ID');
  }

  const query = this.find({ postId: new mongoose.Types.ObjectId(postId) });

  if (options.includeDeleted) {
    query.setOptions({ includeDeleted: true });
  }

  // Validate and sanitize sort option
  if (options.sort) {
    const allowedSortFields = ['createdAt', 'updatedAt', 'author'];
    const sortObj = {};

    if (typeof options.sort === 'object' && !Array.isArray(options.sort)) {
      for (const [field, order] of Object.entries(options.sort)) {
        if (allowedSortFields.includes(field) && (order === 1 || order === -1 || order === 'asc' || order === 'desc')) {
          sortObj[field] = order;
        }
      }
      if (Object.keys(sortObj).length > 0) {
        query.sort(sortObj);
      } else {
        query.sort({ createdAt: -1 });
      }
    } else {
      query.sort({ createdAt: -1 });
    }
  } else {
    query.sort({ createdAt: -1 });
  }

  // Validate and sanitize limit option
  if (options.limit) {
    const limit = parseInt(options.limit, 10);
    if (Number.isInteger(limit) && limit > 0 && limit <= 1000) {
      query.limit(limit);
    }
  }

  return query;
};

/**
 * Static method to count comments by post ID
 */
CommentSchema.statics.countByPostId = function (postId) {
  // Validate postId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error('Invalid post ID');
  }

  return this.countDocuments({ postId: new mongoose.Types.ObjectId(postId), isDeleted: false });
};

module.exports = mongoose.model('Comment', CommentSchema);
