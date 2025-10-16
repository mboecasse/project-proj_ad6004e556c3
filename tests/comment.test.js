// File: tests/comment.test.js
// Generated: 2025-10-16 14:46:32 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_6s81sr8x0x2w


const Comment = require('../src/models/Comment');


const Post = require('../src/models/Post');


const app = require('../src/app');


const mongoose = require('mongoose');


const request = require('supertest');


const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/blog_test';

describe('Comment API Integration Tests', () => {
  let testPostId;
  let testPost;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
  });

  beforeEach(async () => {
    // Create a test post for comment operations
    testPost = await Post.create({
      title: 'Test Post for Comments',
      content: 'This is a test post content',
      author: 'Test Author'
    });
    testPostId = testPost._id.toString();
  });

  afterEach(async () => {
    // Clear collections after each test
    await Comment.deleteMany({});
    await Post.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('POST /api/posts/:postId/comments', () => {
    it('should create a new comment with valid data', async () => {
      const commentData = {
        content: 'This is a test comment',
        author: 'Comment Author'
      };

      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.content).toBe(commentData.content);
      expect(response.body.data.author).toBe(commentData.author);
      expect(response.body.data.post).toBe(testPostId);
    });

    it('should return 400 when content is missing', async () => {
      const commentData = {
        author: 'Comment Author'
      };

      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .send(commentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when author is missing', async () => {
      const commentData = {
        content: 'This is a test comment'
      };

      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .send(commentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when postId does not exist', async () => {
      const nonExistentPostId = new mongoose.Types.ObjectId();
      const commentData = {
        content: 'This is a test comment',
        author: 'Comment Author'
      };

      const response = await request(app)
        .post(`/api/posts/${nonExistentPostId}/comments`)
        .send(commentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 when postId format is invalid', async () => {
      const invalidPostId = 'invalid-id-format';
      const commentData = {
        content: 'This is a test comment',
        author: 'Comment Author'
      };

      const response = await request(app)
        .post(`/api/posts/${invalidPostId}/comments`)
        .send(commentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/posts/:postId/comments', () => {
    it('should return array of comments for a post', async () => {
      // Create test comments
      await Comment.create([
        { content: 'First comment', author: 'Author 1', post: testPostId },
        { content: 'Second comment', author: 'Author 2', post: testPostId },
        { content: 'Third comment', author: 'Author 3', post: testPostId }
      ]);

      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('author');
      expect(response.body.data[0]).toHaveProperty('post');
    });

    it('should return empty array for post with no comments', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return 404 when postId does not exist', async () => {
      const nonExistentPostId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/posts/${nonExistentPostId}/comments`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });
  });

  describe('GET /api/comments/:id', () => {
    it('should return a single comment with post reference', async () => {
      const comment = await Comment.create({
        content: 'Test comment',
        author: 'Test Author',
        post: testPostId
      });

      const response = await request(app)
        .get(`/api/comments/${comment._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(comment._id.toString());
      expect(response.body.data.content).toBe(comment.content);
      expect(response.body.data.author).toBe(comment.author);
      expect(response.body.data.post).toBeDefined();
    });

    it('should return 404 when commentId does not exist', async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/comments/${nonExistentCommentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 when commentId format is invalid', async () => {
      const invalidCommentId = 'invalid-id-format';

      const response = await request(app)
        .get(`/api/comments/${invalidCommentId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('should update comment content and author', async () => {
      const comment = await Comment.create({
        content: 'Original content',
        author: 'Original Author',
        post: testPostId
      });

      const updates = {
        content: 'Updated content',
        author: 'Updated Author'
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(updates.content);
      expect(response.body.data.author).toBe(updates.author);
      expect(response.body.data._id).toBe(comment._id.toString());
    });

    it('should return 400 with invalid data', async () => {
      const comment = await Comment.create({
        content: 'Original content',
        author: 'Original Author',
        post: testPostId
      });

      const invalidUpdates = {
        content: '',
        author: ''
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 when commentId does not exist', async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();
      const updates = {
        content: 'Updated content',
        author: 'Updated Author'
      };

      const response = await request(app)
        .put(`/api/comments/${nonExistentCommentId}`)
        .send(updates)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment', async () => {
      const comment = await Comment.create({
        content: 'Comment to delete',
        author: 'Test Author',
        post: testPostId
      });

      const response = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/deleted/i);
    });

    it('should verify comment deletion with GET request', async () => {
      const comment = await Comment.create({
        content: 'Comment to delete',
        author: 'Test Author',
        post: testPostId
      });

      await request(app)
        .delete(`/api/comments/${comment._id}`)
        .expect(200);

      const getResponse = await request(app)
        .get(`/api/comments/${comment._id}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
      expect(getResponse.body.error).toMatch(/not found/i);
    });

    it('should return 404 when commentId does not exist', async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/comments/${nonExistentCommentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });
  });
});

module.exports = {};
