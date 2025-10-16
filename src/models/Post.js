// File: src/models/Post.js
// Generated: 2025-10-16 14:39:52 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_8zffh4zxn316

    const Comment = require('./Comment');


const mongoose = require('mongoose');

/**
 * Post Schema
 * Represents a blog post with title, content, author and timestamps
 */


const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters long']
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters long']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance optimization
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });

/**
 * Pre-deleteOne middleware
 * Cascade delete all associated comments when post is deleted via deleteOne
 */
PostSchema.pre('deleteOne', async function (next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      await Comment.deleteMany({ post: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-findOneAndDelete middleware
 * Cascade delete all associated comments when post is deleted via findOneAndDelete
 */
PostSchema.pre('findOneAndDelete', async function (next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      await Comment.deleteMany({ post: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-findOneAndRemove middleware
 * Cascade delete all associated comments when post is deleted via findOneAndRemove
 */
PostSchema.pre('findOneAndRemove', async function (next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      await Comment.deleteMany({ post: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Post', PostSchema);
