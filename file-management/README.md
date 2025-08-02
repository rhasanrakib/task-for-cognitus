# File Management Service

A Node.js microservice built with TypeScript, Express, MongoDB, and Kafka that processes Excel files containing IPTV user data and stores them in a database.

## Features

- **Kafka Consumer**: Consumes file upload events from the `user-service`
- **Excel Processing**: Processes Excel files containing IPTV user data
- **Database Storage**: Stores processed data in MongoDB `iptv_users` collection
- **Notification System**: Sends processing notifications via Kafka
- **REST API**: Provides endpoints to manage and view IPTV users
- **Data Validation**: Validates user data including email, IP, and MAC address formats
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Health check endpoints for monitoring

## Architecture

```
┌─────────────────┐    Kafka     ┌─────────────────┐
│   User Service  │─────────────→│ File Management │
│                 │ file-uploads │    Service      │
└─────────────────┘              └─────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │    MongoDB      │
                                 │  iptv_users     │
                                 │   collection    │
                                 └─────────────────┘
```

## Prerequisites

- Node.js 20+
- MongoDB
- Apache Kafka
- Docker & Docker Compose (optional)

## Installation

### Method 1: Using Docker Compose (Recommended)

1. Run with Docker Compose:

```bash
docker-compose up -d
```

Have to install:
- File Management Service (port 3002)
- MongoDB (port 27018)
- Kafka (port 29093)
- Zookeeper

### Method 2: Manual Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy from `.env` file):
```bash
cp .env.example .env
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the service:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_PORT` | Service port | `3002` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `user_service` |
| `KAFKA_CLIENT_ID` | Kafka client identifier | `file-management-service` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:29092` |
| `KAFKA_TOPIC` | Topic to consume from | `file-uploads` |
| `KAFKA_NOTIFICATION_TOPIC` | Topic for notifications | `file-processing-notifications` |
| `EXCEL_PROCESSING_ENABLED` | Enable Excel processing | `true` |

## Excel File Format

The service expects Excel files with the following columns (in order):

| Column | Field | Validation |
|--------|-------|------------|
| A | Name | Required, non-empty |
| B | Username | Required, unique |
| C | Email | Required, valid email format |
| D | IP Address | Required, valid IPv4 format |
| E | MAC Address | Required, valid MAC format |
| F | Account Number | Required, unique |

Example:
```
name        | username  | email              | ip          | mac               | account_number
John Doe    | johndoe   | john@example.com   | 192.168.1.10| AA:BB:CC:DD:EE:FF | ACC001
Jane Smith  | janesmith | jane@example.com   | 192.168.1.11| BB:CC:DD:EE:FF:AA | ACC002
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### IPTV Users
- `GET /api/users` - Get all iptv users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username
- `DELETE /api/users/:id` - Delete user

### Example Responses

**GET /api/users**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "user_name": "johndoe",
      "email": "john@example.com",
      "ip": "192.168.1.10",
      "mac": "AA:BB:CC:DD:EE:FF",
      "account_number": "ACC001",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Kafka Events

### Consumed Events (file-uploads topic)
```json
{
  "userId": "123dfsdf",
  "user_name": "jhon_doe",
  "email": "jhon@example.com",
  "account_number": 12345,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```


## Database Schema

### iptv_users Collection

```javascript
{
  _id: ObjectId,
  name: String,           // User's full name
  user_name: String,      // Unique username
  email: String,          // Unique email (lowercase)
  ip: String,             // IP address
  mac: String,            // MAC address (uppercase)
  account_number: String, // Unique account number
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

**Indexes:**
- `user_name` (unique)
- `email` (unique)
- `mac` (unique)
- `account_number` (unique)


### Health Check
```bash
curl http://localhost:3002/health
```

