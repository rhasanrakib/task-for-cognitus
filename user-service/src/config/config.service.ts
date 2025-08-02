import * as path from 'path';
import * as dotenv from 'dotenv';
import { ServerConfig } from '../types/config.type';

dotenv.config();

export class ConfigService {
  private static instance: ConfigService;
  private config: ServerConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): ServerConfig {
    return {
      app: {
        port: parseInt(process.env.APP_PORT || '3001', 10),
        uploadsDir: path.join(__dirname, '..', '..', 'uploads'),
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
        maxFiles: parseInt(process.env.MAX_FILES || '5', 10),
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      },
      database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.DB_NAME || 'user-service',
      },
      kafka: {
        clientId: process.env.KAFKA_CLIENT_ID || 'user-service',
        brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
        topic: process.env.KAFKA_TOPIC || 'file-uploads',
      },
    };
  }

  public getConfig(): ServerConfig {
    return this.config;
  }

  public getAppConfig() {
    return this.config.app;
  }

  public getKafkaConfig() {
    return this.config.kafka;
  }

  public getAuthConfig() {
    return this.config.auth;
  }

  public getDatabaseConfig() {
    return this.config.database;
  }
}
