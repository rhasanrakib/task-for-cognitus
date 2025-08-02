export type FileMetadata = {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export type UploadResponse ={
  success: boolean;
  message: string;
  data: {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

export type MultipleUploadResponse ={
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
  }>;
}

export type FileInfo = {
  filename: string;
  size: number;
  created: Date;
  modified: Date;
}

export type HealthResponse = {
  status: string;
  timestamp: string;
  service: string;
}

export type ErrorResponse = {
  error: string;
  message: string;
  details?: string;
}
