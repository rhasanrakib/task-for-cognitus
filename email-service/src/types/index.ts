export interface NotificationEvent {
  type: 'account_created' | 'processing_error';
  userId: string;
  name: string;
  email?: string;
  error?: string;
  processedAt: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  recipients: string[];
}

export interface EmailConfig {
  from: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  admin: string;
  enabled: boolean;
}

export interface ProcessingStats {
  totalNotifications: number;
  accountsCreated: number;
  processingErrors: number;
  lastProcessedAt?: string;
}
