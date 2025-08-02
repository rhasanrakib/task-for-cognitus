# Email Notification Service

A Node.js microservice built with TypeScript, Express, and Kafka that consumes file processing notifications from the file-management service and sends email alerts (mocked with console logging).

## 🎯 Purpose

The Email Service:
- **Consumes Kafka notifications** from the `file-processing-notifications` topic
- **Processes notification events** (success/error) from file-management service
- **Sends email notifications** (currently mocked with detailed console logging)
- **Tracks processing statistics** and generates daily summaries
- **Provides REST API** for monitoring and management

##  Architecture

```
┌─────────────────┐    Kafka     ┌─────────────────┐
│ File Management │─────────────→│  Email Service  │
│    Service      │notifications │                 │
└─────────────────┘              └─────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │ Email Templates │
                                 │ (Console Log)   │
                                 └─────────────────┘
```


## Quick Start

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Installation
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the service
npm start

# For development
npm run dev
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_PORT` | Service port | `3004` |
| `KAFKA_CLIENT_ID` | Kafka client identifier | `email-service` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:29092` |
| `KAFKA_NOTIFICATION_TOPIC` | Topic to consume from | `file-processing-notifications` |
| `KAFKA_GROUP_ID` | Consumer group ID | `email-service-group` |
| `EMAIL_FROM` | Sender email address | `notifications@example.com` |
| `ADMIN_EMAIL` | Admin email for notifications | `admin@example.com` |
| `ENABLE_EMAIL_NOTIFICATIONS` | Enable/disable emails | `true` |
| `EMAIL_SMTP_HOST` | SMTP server host | `smtp.example.com` |
| `EMAIL_SMTP_PORT` | SMTP server port | `587` |
| `EMAIL_SMTP_USER` | SMTP username | `notifications@example.com` |
| `EMAIL_SMTP_PASS` | SMTP password | `password` |






## 🐳 Docker Deployment

### Single Service
```bash
docker build -t email-service .
docker run -p 3004:3004 email-service
```

This starts:
- Email Service (port 3004)
- Kafka (port 29094)
- Zookeeper


## 🔧 Development

### Project Structure
```
email-service/
├── src/
│   ├── config/           # Configuration management
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript interfaces
│   ├── app.ts           # Express application
│   └── index.ts         # Entry point
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Key Services


### Build & Run
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```