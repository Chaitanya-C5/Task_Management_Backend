# Task Management API

A comprehensive Node.js REST API for task management with user authentication, categories, and advanced filtering capabilities.

## Features

- **User Authentication**: JWT-based auth with access/refresh tokens
- **Task Management**: CRUD operations with status tracking and priorities
- **Categories**: Organize tasks with custom categories and colors
- **Advanced Filtering**: Search, filter by status/priority/category, date ranges
- **Security**: Rate limiting, input sanitization, CORS protection
- **Error Handling**: Comprehensive error responses with proper HTTP status codes

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Express-validator** for input validation
- **Express-rate-limit** for rate limiting
- **ESLint** for code quality

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chaitanya-C5/Task_Management_Backend.git
   cd Task_Management_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task_management
   JWT_ACCESS_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   JWT_ACCESS_EXPIRES_IN=3600
   JWT_REFRESH_EXPIRES_IN=604800
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | - | JWT access token secret |
| `JWT_REFRESH_SECRET` | No | JWT_ACCESS_SECRET | JWT refresh token secret |
| `JWT_ACCESS_EXPIRES_IN` | No | 3600 | Access token expiration (seconds) |
| `JWT_REFRESH_EXPIRES_IN` | No | 604800 | Refresh token expiration (seconds) |

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f67890123456",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "3600"
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Category Endpoints

#### Get User Categories
```http
GET /api/categories
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "64a1b2c3d4e5f67890123456",
        "name": "Work",
        "color": "#3B82F6",
        "taskCount": 5,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### Create Category
```http
POST /api/categories
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Personal",
  "color": "#10B981"
}
```

#### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer <access_token>
```

### Task Endpoints

#### Get Tasks
```http
GET /api/tasks?status=todo,priority=high&page=1&limit=10&search=project
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` - Filter by status (todo,in-progress,completed,archived)
- `priority` - Filter by priority (low,medium,high)
- `category` - Filter by category ID
- `search` - Search in title and description
- `dueDate[gte]` - Due date from (YYYY-MM-DD)
- `dueDate[lte]` - Due date to (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc,desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "64a1b2c3d4e5f67890123456",
        "title": "Complete project",
        "description": "Finish the task management API",
        "status": "in-progress",
        "priority": "high",
        "dueDate": "2024-01-20T00:00:00.000Z",
        "category": {
          "id": "64a1b2c3d4e5f67890123457",
          "name": "Work",
          "color": "#3B82F6"
        },
        "tags": ["urgent", "backend"],
        "estimatedHours": 8,
        "actualHours": 4,
        "completedAt": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    },
    "stats": {
      "todo": 10,
      "in-progress": 8,
      "completed": 5,
      "archived": 2
    }
  }
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "New task",
  "description": "Task description",
  "priority": "medium",
  "dueDate": "2024-01-25T00:00:00.000Z",
  "category": "64a1b2c3d4e5f67890123456",
  "tags": ["important"],
  "estimatedHours": 4
}
```

#### Get Single Task
```http
GET /api/tasks/:id
Authorization: Bearer <access_token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated task title",
  "priority": "high",
  "actualHours": 6
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <access_token>
```

#### Update Task Status
```http
PUT /api/tasks/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "completed"
}
```

#### Update Task Priority
```http
PUT /api/tasks/:id/priority
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "priority": "low"
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [
      {
        "field": "fieldName",
        "message": "Specific error message"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate resource
- `RATE_LIMIT` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Login**: 3 attempts per 15 minutes
- **Registration**: 10 attempts per hour

## Security Features

- JWT-based authentication with access/refresh tokens
- Input sanitization against XSS and injection attacks
- CORS protection with configurable origins
- Rate limiting to prevent abuse
- Password hashing with bcrypt
- User authorization (users can only access their own data)

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Auto-restart in Development
```bash
npm run dev
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
