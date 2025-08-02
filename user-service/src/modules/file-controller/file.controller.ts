import { Request, Response } from 'express';
import {
  UploadResponse,
  ErrorResponse,
} from '../../types/file-metadata.type';
import { FileService } from './file.service';
import { KafkaService } from '../shared/kafka.service';

export class FileController {
  private static instance: FileController;
  private fileService: FileService;
  private kafkaService: KafkaService;

  private constructor() {
    this.fileService = FileService.getInstance();
    this.kafkaService = KafkaService.getInstance();
  }

  public static getInstance(): FileController {
    if (!FileController.instance) {
      FileController.instance = new FileController();
    }
    return FileController.instance;
  }

  public async uploadSingle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        const errorResponse: ErrorResponse = {
          error: 'No file uploaded',
          message: 'Please select a file to upload',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const fileMetadata = this.fileService.createFileMetadata(
        req.file,
        req.body.userId,
        req.body.description
      );

      // Send metadata to Kafka
      await this.kafkaService.sendFileMetadata(fileMetadata);

      const response: UploadResponse = {
        success: true,
        message: 'File uploaded and sent to Kafka successfully',
        data: {
          id: fileMetadata.id,
          originalName: fileMetadata.originalName,
          size: fileMetadata.size,
          mimeType: fileMetadata.mimeType,
          uploadedAt: fileMetadata.uploadedAt,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error(' Upload error:', error);

      // Clean up file if Kafka send failed
      if (req.file && this.fileService.fileExists(req.file.filename)) {
        this.fileService.deleteFile(req.file.path);
      }

      const errorResponse: ErrorResponse = {
        error: 'Upload failed',
        message: 'Failed to process file upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      };

      res.status(500).json(errorResponse);
    }
  }


  public async getFileInfo(req: Request, res: Response): Promise<void> {
    const filename = req.params.filename;
    
    const fileInfo = this.fileService.getFileInfo(filename);
    
    if (!fileInfo) {
      const errorResponse: ErrorResponse = {
        error: 'File not found',
        message: 'The requested file does not exist',
      };
      res.status(404).json(errorResponse);
      return;
    }

    res.json(fileInfo);
  }

  public async downloadFile(req: Request, res: Response): Promise<void> {
    const filename = req.params.filename;
    const filePath = this.fileService.getFilePath(filename);
    
    if (!this.fileService.fileExists(filename)) {
      const errorResponse: ErrorResponse = {
        error: 'File not found',
        message: 'The requested file does not exist',
      };
      res.status(404).json(errorResponse);
      return;
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        const errorResponse: ErrorResponse = {
          error: 'Download failed',
          message: 'Failed to download file',
        };
        res.status(500).json(errorResponse);
      }
    });
  }
}
