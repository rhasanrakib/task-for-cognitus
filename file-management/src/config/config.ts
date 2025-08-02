import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  app: {
    port: number;
  };
  database: {
    uri: string;
    name: string;
  };
  kafka: {
    clientId: string;
    brokers: string[];
    topic: string;
    notificationTopic: string;
  };
  fileProcessing: {
    excelEnabled: boolean;
  };
}

export const config: Config = {
  app: {
    port: parseInt(process.env.APP_PORT || '3002', 10),
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    name: process.env.DB_NAME || 'user_service',
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'file-management-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
    topic: process.env.KAFKA_TOPIC || 'file-uploads',
    notificationTopic: process.env.KAFKA_NOTIFICATION_TOPIC || 'file-processing-notifications',
  },
  fileProcessing: {
    excelEnabled: process.env.EXCEL_PROCESSING_ENABLED === 'true',
  },
};
