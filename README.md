# Task - Microservices File Processing System

A comprehensive microservices architecture built with Node.js, TypeScript, MongoDB, and Apache Kafka for handling file uploads, processing, and notifications.

## 🏗️ Architecture Overview

```
┌─────────────────┐    Kafka     ┌─────────────────┐    Kafka     ┌─────────────────┐
│   User Service  │─────────────→│ File Management │─────────────→│  Email Service  │
│                 │ file-uploads │    Service      │notifications │                 │
│ • Authentication│              │ • Excel Process │              │ • Notifications │
│ • File Upload   │              │ • Data Storage  │              │ • Email Alerts  │
│ • JWT Auth      │              │ • IPTV Users    │              │ • Statistics    │
└─────────────────┘              └─────────────────┘              └─────────────────┘
         │                                │                                │
         │                                ▼                                │
         │                       ┌─────────────────┐                       │
         │                       │    MongoDB      │                       │
         │                       │  • users        │                       │
         │                       │  • iptv_users   │                       │
         │                       └─────────────────┘                       │
         │                                                                 │
         └─────────────────────────────────────────────────────────────────┘
                                    File Storage
```

## 📁 Project Structure

```
Task/
├── 📄 README.md              # This file - project overview
├── 📄 Makefile               # Build and deployment automation
├── 🔧 .env.example           # Environment variables template
│
├── 📁 infra/                 # Infrastructure services
│   └── docker-compose.yml    # MongoDB, Kafka, Zookeeper
│
├── 📁 user-service/          # User & File Upload Service
│   ├── src/
│   │   ├── config/           # Configuration management
│   │   ├── middleware/       # Auth, Upload, Error handling
│   │   ├── models/           # User models
│   │   ├── modules/          # Feature modules (file, user, shared)
│   │   ├── routes/           # API routes
│   │   └── types/            # TypeScript type definitions
│   ├── tests/                # Jest test suite
│   ├── uploads/              # File storage directory
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── 📁 file-management/       # File Processing Service
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # IPTV user controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── types/            # Type definitions
│   ├── uploads/              # Processed files
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
└── 📁 email-service/         # Email Notification Service
    ├── src/
    │   ├── config/           # Configuration
    │   ├── services/         # Email and Kafka services
    │   └── types/            # Type definitions
    ├── Dockerfile
    ├── docker-compose.yml
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Make (for using Makefile commands)
- Node.js 20+ (for local development)


### 1. Start Everything
```bash
# Start all services (infrastructure + applications)
make up

# Or step by step:
make infra-up    # Start MongoDB, Kafka, Zookeeper
make apps-up     # Start all application services
```

### 2. Verify Services
```bash
make status      # Check all services status
make logs        # View logs from all services
```

## 🛠️ Available Make Commands

### 🔄 Main Operations
```bash
make up          # Start all services
make down        # Stop all services
make restart     # Restart all services
make build       # Build all application images
make clean       # Clean containers, networks, volumes
make status      # Show status of all services
make logs        # Show logs for all services
```

### 🏗️ Infrastructure Management
```bash
make infra-up    # Start MongoDB, Kafka, Zookeeper
make infra-down  # Stop infrastructure services
make infra-logs  # View infrastructure logs
```

### 📱 Application Management
```bash
make apps-up     # Start all application services
make apps-down   # Stop all application services
make apps-build  # Build all application services
make apps-logs   # View application logs
```

### 🎯 Individual Service Management
```bash
# User Service
make user-up     # Start user service
make user-down   # Stop user service
make user-logs   # View user service logs
make user-exec   # Execute bash in user service container
make user-build  # Build user service

# File Management Service
make file-up     # Start file management service
make file-down   # Stop file management service
make file-logs   # View file management logs
make file-exec   # Execute bash in file management container
make file-build  # Build file management service

# Email Service
make email-up    # Start email service
make email-down  # Stop email service
make email-logs  # View email service logs
make email-exec  # Execute bash in email service container
make email-build # Build email service
```

### ⚡ Quick Commands
```bash
make dev-setup           # Complete development setup
make quick-restart-apps  # Quick restart all apps
make quick-restart-infra # Quick restart infrastructure
```

## 🌐 Service Endpoints

### User Service (Port 3001)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/files/upload` - File upload (requires auth)
- `GET /api/files/:filename` - File information (requires auth)
- `GET /api/files/download/:filename` - File download (requires auth)

### File Management Service (Port 3002)
- `GET /api/health` - Health check
- `GET /api/iptv-users` - List all IPTV users
- `GET /api/iptv-users/:id` - Get specific IPTV user
- `PUT /api/iptv-users/:id` - Update IPTV user
- `DELETE /api/iptv-users/:id` - Delete IPTV user

### Email Service (Port 3003)
- `GET /api/health` - Health check
- `GET /api/stats` - Email statistics

## 🧪 Testing

### User Service Tests
The user service includes comprehensive Jest tests for file upload functionality:

```bash
cd user-service
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```


## 🔧 Configuration

### Environment Variables

Each service uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```bash
# Infrastructure
MONGODB_URI=mongodb://mongo:27017
KAFKA_BROKERS=kafka:9092

# User Service
USER_SERVICE_PORT=3001
JWT_SECRET=your-secret-key
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=10485760

# File Management Service
FILE_SERVICE_PORT=3002
KAFKA_TOPIC=file-uploads

# Email Service
EMAIL_SERVICE_PORT=3003
KAFKA_NOTIFICATIONS_TOPIC=file-processing-notifications
```

### Kafka Topics
- `file-uploads` - File upload notifications from user-service
- `file-processing-notifications` - Processing results from file-management-service


### View Logs
```bash
# All services
make logs

# Individual services
make user-logs
make file-logs
make email-logs
make infra-logs
```

### Kafka Management
```bash
# List topics
docker exec -it task-kafka kafka-topics --bootstrap-server localhost:9092 --list

# View messages
docker exec -it task-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic file-uploads --from-beginning
```

## Development

### Local Development Setup
```bash
# Setup development environment


# For individual service development
cd user-service
npm install
npm run dev

cd file-management  
npm install
npm run dev

cd email-service
npm install
npm run dev
```

### Adding New Features
1. Implement changes in the respective service
2. Add tests for new functionality
3. Update service documentation
4. Rebuild and test with `make build && make restart`

## 🐛 Troubleshooting

### Common Issues

**Services not starting:**
```bash
make clean    # Clean up everything
make network  # Recreate network
make up       # Start fresh
```

**Kafka connection issues:**
```bash
make infra-logs  # Check Kafka/Zookeeper logs
# Ensure services start in order: Zookeeper → Kafka → Applications
```

**File upload issues:**
```bash
make user-logs   # Check user service logs
# Verify uploads directory permissions
# Check file size limits in configuration
```

**Database connection issues:**
```bash
make infra-logs  # Check MongoDB logs
# Verify MongoDB is running on port 27017
```

## 📝 API Documentation

For detailed API documentation, refer to individual service README files:
- [User Service API](./user-service/README.md)
- [File Management API](./file-management/README.md)
- [Email Service API](./email-service/README.md)

