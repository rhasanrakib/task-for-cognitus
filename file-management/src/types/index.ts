export interface IptvUser {
  name: string;
  user_name: string;
  email: string;
  ip: string;
  mac: string;
  account_number: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileUploadEvent {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  userId: string;
  uploadedAt: string;
}

export interface NotificationEvent {
  type: 'account_created' | 'processing_error';
  userId: string;
  name: string;
  email?: string;
  error?: string;
  processedAt: string;
}
