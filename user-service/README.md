# User Service - File Upload with JWT Authentication & Kafka Integration (TypeScript)

A TypeScript-based Node.js service with OOP architecture that handles user authentication, file uploads, and sends file metadata to Apache Kafka.

## Architecture

The service follows Object-Oriented Programming principles with a modular structure:

```
src/
├── config/           # Configuration management
│   └── config.service.ts
├── middleware/       # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── upload.middleware.ts
├── models/           # Database models
│   └── user.model.ts
├── modules/          # Feature modules
│   ├── file-controller/
│   │   ├── file.controller.ts
│   │   └── file.service.ts
│   ├── user-controller/
│   │   └── user.controller.ts
│   └── shared/
│       ├── auth.service.ts
│       ├── database.service.ts
│       └── kafka.service.ts
├── routes/           # Route definitions
│   ├── file-routes.ts
│   └── user-routes.ts
├── types/            # TypeScript type definitions
│   ├── config.type.ts
│   ├── file-metadata.type.ts
│   ├── kafka.type.ts
│   └── user.type.ts
├── server.ts         # Server class
└── index.ts          # Application entry point
```



## Installation

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Configure environment variables in `.env`:
```env
# Server Configuration
APP_PORT=3001

# Database Configuration
MONGODB_URI=mongodb://mongo:27017
DB_NAME=user_service

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# File Upload Configuration
MAX_FILE_SIZE=10485760
MAX_FILES=5

# Kafka Configuration
KAFKA_CLIENT_ID=user-service
KAFKA_BROKERS=kafka:9092
KAFKA_TOPIC=file-uploads
```
MAX_FILES=5
```

4. Start the service:
```bash
# Development mode with TypeScript
npm run dev

# Production mode (compiled JavaScript)
npm start
```

## Development Scripts

```bash
# TypeScript development with auto-reload
npm run dev

# TypeScript development with nodemon
npm run dev:watch

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Run Kafka consumer (TypeScript)
npm run consumer

# Run Kafka consumer (compiled JavaScript)
npm run consumer:js

# Clean build directory
npm run clean
```


## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f1234567890abcdef12345",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-07-30T10:30:00.000Z",
      "updatedAt": "2025-07-30T10:30:00.000Z"
    }
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

#### Health Check
```
GET /api/auth/health
```

### File Management Endpoints (Protected)

All file endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### Single File Upload
```
POST /api/files/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Body:
- file: File to upload (required)
- userId: User ID (optional)
- description: File description (optional)
```

**Example Response:**
```json
{
  "success": true,
  "message": "File uploaded and sent to Kafka successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-07-30T10:30:00.000Z"
  }
}
```





## Docker Usage

Build and run with Docker:

```bash
docker build -t user-service .
docker run -p 3001:3001 user-service
```

Or use with docker-compose:

```bash
docker-compose up
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| APP_PORT | 3001 | Server port |
| MONGODB_URI | mongodb://mongo:27017 | MongoDB connection string |
| DB_NAME | user_service | Database name |
| JWT_SECRET | your-super-secret... | JWT signing secret (change in production!) |
| JWT_EXPIRES_IN | 7d | JWT token expiration time |
| BCRYPT_ROUNDS | 12 | Password hashing rounds |
| KAFKA_BROKERS | kafka:9092 | Kafka broker addresses |
| KAFKA_CLIENT_ID | user-service | Kafka client identifier |
| KAFKA_TOPIC | file-uploads | Kafka topic for file metadata |
| MAX_FILE_SIZE | 10485760 | Maximum file size in bytes |
| MAX_FILES | 5 | Maximum number of files in batch upload |

## End points

#### 1. Register a new user
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Upload file (with JWT token)
```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "description=Test document"
```
  http://localhost:3001/upload/multiple
```

## Development

Start in development mode:
```bash
npm run dev
```

The service will automatically restart when files change.
