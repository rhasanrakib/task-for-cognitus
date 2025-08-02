import dotenv from 'dotenv';
import { EmailConfig } from '../types';

dotenv.config();

export interface Config {
  app: {
    port: number;
  };
  kafka: {
    clientId: string;
    brokers: string;
    notificationTopic: string;
    groupId: string;
  };
  email: EmailConfig;
}

export const config: Config = {
  app: {
    port: parseInt(process.env.APP_PORT || '3004', 10),
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'email-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:29092'),
    notificationTopic: process.env.KAFKA_NOTIFICATION_TOPIC || 'file-processing-notifications',
    groupId: process.env.KAFKA_GROUP_ID || 'email-service-group',
  },
  email: {
    from: process.env.EMAIL_FROM || 'notifications@example.com',
    smtp: {
      host: process.env.EMAIL_SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
      user: process.env.EMAIL_SMTP_USER || 'notifications@example.com',
      pass: process.env.EMAIL_SMTP_PASS || 'password',
    },
    admin: process.env.ADMIN_EMAIL || 'admin@example.com',
    enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  },
};
