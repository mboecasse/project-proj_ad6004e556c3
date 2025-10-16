# 📝 Blog API

A production-ready RESTful API for managing blog posts and comments built with Node.js, Express, and MongoDB. Features comprehensive security measures, rate limiting, input validation, and extensive test coverage.

**Key Features:**
- ✅ Full CRUD operations for blog posts and comments
- 🔒 Enterprise-grade security with Helmet, CORS, and input sanitization
- 🚦 Intelligent rate limiting with Redis support
- ✔️ Comprehensive input validation with express-validator
- 📊 Structured logging with Winston
- 🧪 Extensive test suite with Jest and Supertest
- 🔄 Graceful shutdown handling
- 📈 Health check endpoints for monitoring

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 14.0.0 (recommended: 18.x LTS)
- **MongoDB**: >= 4.4 (local installation or MongoDB Atlas account)
- **Redis**: >= 4.0 (optional, for distributed rate limiting)
- **npm** or **yarn**: Latest version

### System Requirements

- **RAM**: Minimum 512MB
- **Disk Space**: 100MB for dependencies
- **OS**: Linux, macOS, or Windows

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blog-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#-environment-variables) section below).

### 4. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Add it to your `.env` file

### 5. Verify Installation

```bash
npm run dev
```

The server should start on `http://localhost:3000` (or your configured port).

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/blog` |
| `JWT_ACCESS_SECRET` | Secret key for JWT access tokens (min 32 chars) | `your_super_secret_access_key_here_min_32_chars` |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens (min 32 chars) | `your_super_secret_refresh_key_here_min_32_chars` |

### Optional Variables (with defaults)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `PORT` | Server port number | `3000` |
| `DB_NAME` | MongoDB database name | `blog_db` |
| `JWT_ACCESS_EXPIRY` | Access token expiration time | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `LOG_LEVEL` | Winston logging level (`error`, `warn`, `info`, `debug`) | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` |
| `DEFAULT_PAGE_SIZE` | Default pagination page size | `10` |
| `MAX_PAGE_SIZE` | Maximum pagination page size | `100` |

### Example `.env` File

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blog
DB_NAME=blog_db

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_here_must_be_at_least_32_characters_long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_must_be_different_from_access_secret
JWT_REFRESH_EXPIRY=7d

# Security Configuration
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Pagination Configuration
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

---

## 🎯 How to Run

### Development Mode

Runs the server with hot-reload using nodemon:

```bash
npm run dev
```

Server will restart automatically when you make changes to the code.

### Production Mode

Runs the optimized production server:

```bash
npm start
```

### Run Tests

Execute the test suite with coverage report:

```bash
npm test
```

### Additional Scripts

```bash
# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health status and database connection | ❌ |
| GET | `/api/health` | Detailed health check with uptime | ❌ |

### Posts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts (with pagination & filtering) | ❌ |
| GET | `/api/posts/:id` | Get single post by ID | ❌ |
| POST | `/api/posts` | Create new post | ❌ |
| PUT | `/api/posts/:id` | Update post by ID | ❌ |
| DELETE | `/api/posts/:id` | Delete post by ID (cascade deletes comments) | ❌ |

**Query Parameters for GET /api/posts:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `author` - Filter by author name (case-insensitive)
- `search` - Search in title and content (case-insensitive)

**Request Body for POST/PUT:**
```json
{
  "title": "My Blog Post Title",
  "content": "The content of my blog post...",
  "author": "John Doe"
}
```

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts/:postId/comments` | Get all comments for a post | ❌ |
| GET | `/api/comments/:id` | Get single comment by ID | ❌ |
| POST | `/api/posts/:postId/comments` | Create new comment on a post | ❌ |
| PUT | `/api/comments/:id` | Update comment by ID | ❌ |
| DELETE | `/api/comments/:id` | Delete comment by ID (soft delete) | ❌ |

**Request Body for POST/PUT:**
```json
{
  "content": "This is my comment...",
  "author": "Jane Smith"
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ /* validation errors if applicable */ ]
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "posts": [ /* array of posts */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

## 🏗️ Architecture Overview

### Project Structure

```
blog-api/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server initialization & graceful shutdown
│   ├── config/
│   │   ├── database.js           # MongoDB connection with retry logic
│   │   └── env.js                # Environment validation with Joi
│   ├── controllers/
│   │   ├── commentController.js  # Comment business logic
│   │   └── postController.js     # Post business logic
│   ├── middleware/
│   │   ├── errorHandler.js       # Global error handling
│   │   ├── rateLimiter.js        # Rate limiting configurations
│   │   ├── security.js           # Security middleware (Helmet, CORS)
│   │   └── validator.js          # Request validation wrapper
│   ├── models/
│   │   ├── Comment.js            # Comment Mongoose schema
│   │   └── Post.js               # Post Mongoose schema
│   ├── routes/
│   │   ├── commentRoutes.js      # Comment API routes
│   │   ├── healthRoutes.js       # Health check routes
│   │   ├── index.js              # Route aggregator
│   │   └── postRoutes.js         # Post API routes
│   ├── utils/
│   │   ├── apiResponse.js        # Standardized API responses
│   │   └── logger.js             # Winston logger configuration
│   └── validators/
│       ├── commentValidator.js   # Comment validation rules
│       └── postValidator.js      # Post validation rules
├── tests/
│   ├── comment.test.js           # Comment API integration tests
│   ├── post.test.js              # Post API integration tests
│   ├── setup.js                  # Jest test environment setup
│   └── globalSetup.js            # Global test configuration
├── logs/                         # Application logs (production)
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── jest.config.js                # Jest testing configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### Technology Stack

**Core:**
- **Express.js** - Fast, unopinionated web framework
- **Mongoose** - MongoDB ODM with schema validation
- **MongoDB** - NoSQL database for flexible data storage

**Security:**
- **Helmet** - Security headers middleware
- **CORS** - Cross-Origin Resource Sharing configuration
- **express-mongo-sanitize** - NoSQL injection prevention
- **HPP** - HTTP Parameter Pollution protection
- **express-rate-limit** - Rate limiting with Redis support

**Validation & Logging:**
- **Joi** - Environment variable validation
- **express-validator** - Request data validation
- **Winston** - Structured logging with multiple transports
- **Morgan** - HTTP request logging

**Testing:**
- **Jest** - Testing framework with coverage
- **Supertest** - HTTP assertion library
- **mongodb-memory-server** - In-memory MongoDB for tests

### Data Flow

1. **Request** → Rate Limiter → Security Middleware → Body Parser
2. **Routing** → Route Handler → Validator Middleware
3. **Controller** → Business Logic → Model (Database)
4. **Response** → API Response Formatter → Client
5. **Errors** → Error Handler → Structured Error Response

### Key Design Decisions

- **Mongoose Centralization**: Single database connection module prevents connection leaks
- **Soft Deletes**: Comments use soft delete to maintain data integrity
- **Cascade Deletes**: Deleting a post automatically removes associated comments
- **Validation Layers**: Schema validation (Mongoose) + Request validation (express-validator)
- **Graceful Shutdown**: Handles SIGTERM/SIGINT for clean container/deployment shutdowns
- **Environment Validation**: Joi validates all env vars at startup (fail-fast approach)

---

## 🐛 Common Issues & Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=3001
```

### MongoDB Connection Failed

**Error:** `Failed to connect to MongoDB`

**Solutions:**

1. **Check MongoDB is running:**
```bash
sudo systemctl status mongod  # Linux
brew services list  # macOS
```

2. **Verify connection string:**
```bash
# Test connection
mongosh "mongodb://localhost:27017/blog"
```

3. **Check firewall rules:**
```bash
# Allow MongoDB port
sudo ufw allow 27017  # Linux
```

4. **MongoDB Atlas issues:**
   - Whitelist your IP address in Atlas dashboard
   - Verify username/password in connection string
   - Check cluster is running

### Environment Variable Errors

**Error:** `ENVIRONMENT VARIABLE VALIDATION FAILED`

**Solution:**

1. Ensure `.env` file exists in root directory
2. Check all required variables are set:
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET` (min 32 characters)
   - `JWT_REFRESH_SECRET` (min 32 characters)
3. Verify no typos in variable names
4. Remove quotes from values in `.env`

### Test Failures

**Error:** Tests fail with database errors

**Solutions:**

1. **Set test database URI:**
```bash
export MONGODB_TEST_URI="mongodb://localhost:27017/blog_test"
```

2. **Clear test database:**
```bash
mongosh blog_test --eval "db.dropDatabase()"
```

3. **Check MongoDB Memory Server:**
```bash
npm install mongodb-memory-server --save-dev
```

### Rate Limit Issues

**Error:** `Too many requests from this IP`

**Solutions:**

1. **Increase rate limit in `.env`:**
```env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000
```

2. **Clear Redis cache (if using Redis):**
```bash
redis-cli FLUSHDB
```

3. **Wait for rate limit window to expire** (default: 15 minutes)

### CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**

1. **Update CORS_ORIGIN in `.env`:**
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

2. **For development, allow all origins:**
```env
CORS_ORIGIN=*
```
⚠️ **Never use `*` in production!**

### Validation Errors

**Error:** `Validation failed` with unclear message

**Solutions:**

1. Check request body matches expected format
2. Verify required fields are present
3. Check field length constraints:
   - Post title: 3-200 characters
   - Post content: 10-100,000 characters
   - Comment content: 1-2,000 characters
   - Author: 2-100 characters

### Logs Not Appearing

**Issue:** No logs in console or files

**Solutions:**

1. **Check LOG_LEVEL in `.env`:**
```env
LOG_LEVEL=debug  # Most verbose
```

2. **Verify logs directory exists:**
```bash
mkdir -p logs
chmod 755 logs
```

3. **Check NODE_ENV setting:**
```env
NODE_ENV=development  # Enables console logs
```

---

##