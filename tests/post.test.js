// File: tests/post.test.js
// Generated: 2025-10-16 14:49:47 UTC
// Project ID: proj_ad6004e556c3
// Task ID: task_7b8ykmd4pwe5


const Post = require('../src/models/Post');


const app = require('../src/app');


const mongoose = require('mongoose');


const request = require('supertest');


const TEST_DB_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/blog-test-' + Date.now();

describe('Post API Integration Tests', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(TEST_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 5000
      });
    } catch (error) {
      console.error('Failed to connect to test database:', error.message);
      throw new Error(`Database connection failed: ${error.message}. Please ensure MongoDB is running and MONGO_TEST_URI is properly configured.`);
    }
  }, 10000);

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection is not ready');
    }
    await Post.deleteMany({});
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await Post.deleteMany({});
      await mongoose.connection.close();
    }
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test content for the post',
        author: 'John Doe'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.content).toBe(postData.content);
      expect(response.body.data.author).toBe(postData.author);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should fail to create post without title', async () => {
      const postData = {
        content: 'This is test content',
        author: 'John Doe'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create post without content', async () => {
      const postData = {
        title: 'Test Post',
        author: 'John Doe'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create post without author', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test content'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create post with title less than 3 characters', async () => {
      const postData = {
        title: 'Te',
        content: 'This is test content',
        author: 'John Doe'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to create post with content less than 10 characters', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Short',
        author: 'John Doe'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/posts', () => {
    it('should return empty array when no posts exist', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all posts', async () => {
      const posts = [
        { title: 'Post 1', content: 'Content for post 1', author: 'Author 1' },
        { title: 'Post 2', content: 'Content for post 2', author: 'Author 2' },
        { title: 'Post 3', content: 'Content for post 3', author: 'Author 3' }
      ];

      await Post.insertMany(posts);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
      expect(response.body.data[0]).toHaveProperty('_id');
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('author');
    });

    it('should return posts sorted by creation date (newest first)', async () => {
      const post1 = await Post.create({
        title: 'First Post',
        content: 'Content for first post',
        author: 'Author 1'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const post2 = await Post.create({
        title: 'Second Post',
        content: 'Content for second post',
        author: 'Author 2'
      });

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].title).toBe('Second Post');
      expect(response.body.data[1].title).toBe('First Post');
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by ID', async () => {
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test content for the post',
        author: 'Test Author'
      });

      const response = await request(app)
        .get(`/api/posts/${post._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(post._id.toString());
      expect(response.body.data.title).toBe(post.title);
      expect(response.body.data.content).toBe(post.content);
      expect(response.body.data.author).toBe(post.author);
    });

    it('should return 404 for non-existent post ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Post not found');
    });

    it('should return 400 for invalid post ID format', async () => {
      const response = await request(app)
        .get('/api/posts/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post with valid data', async () => {
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original content for the post',
        author: 'Original Author'
      });

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content for the post',
        author: 'Updated Author'
      };

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.content).toBe(updateData.content);
      expect(response.body.data.author).toBe(updateData.author);
      expect(response.body.data.updatedAt).not.toBe(post.updatedAt);
    });

    it('should partially update a post', async () => {
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original content',
        author: 'Original Author'
      });

      const updateData = {
        title: 'Updated Title Only'
      };

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.content).toBe(post.content);
      expect(response.body.data.author).toBe(post.author);
    });

    it('should return 404 for non-existent post ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        author: 'Updated Author'
      };

      const response = await request(app)
        .put(`/api/posts/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Post not found');
    });

    it('should return 400 for invalid post ID format', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .put('/api/posts/invalid-id')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to update with invalid title length', async () => {
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original content',
        author: 'Original Author'
      });

      const updateData = {
        title: 'Ab'
      };

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to update with invalid content length', async () => {
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original content',
        author: 'Original Author'
      });

      const updateData = {
        content: 'Short'
      };

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post by ID', async () => {
      const post = await Post.create({
        title: 'Post to Delete',
        content: 'Content for post to delete',
        author: 'Test Author'
      });

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post deleted successfully');

      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for non-existent post ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Post not found');
    });

    it('should return 400 for invalid post ID format', async () => {
      const response = await request(app)
        .delete('/api/posts/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should cascade delete comments when post is deleted', async () => {
      const post = await Post.create({
        title: 'Post with Comments',
        content: 'Content for post with comments',
        author: 'Test Author'
      });

      await request(app)
        .delete(`/api/posts/${post._id}`)
        .expect(200);

      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/posts')
        .expect(500);

      expect(response.body.success).toBe(false);

      await mongoose.connect(TEST_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 5000
      });
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test", invalid json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should trim whitespace from title and content', async () => {
      const postData = {
        title: '  Test Post  ',
        content: '  This is test content  ',
        author: '  John Doe  '
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Post');
      expect(response.body.data.content).toBe('This is test content');
      expect(response.body.data.author).toBe('John Doe');
    });

    it('should accept maximum length title', async () => {
      const longTitle = '

}}})))