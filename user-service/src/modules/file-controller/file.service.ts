import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileMetadata, FileInfo } from '../../types/file-metadata.type';
import { ConfigService } from '../../config/config.service';

export class FileService {
  private static instance: FileService;
  private config: ConfigService;
  private uploadsDir: string;

  private constructor() {
    this.config = ConfigService.getInstance();
    this.uploadsDir = this.config.getAppConfig().uploadsDir;
    this.ensureUploadsDirectory();
  }

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  private ensureUploadsDirectory(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  public generateFileName(originalName: string): string {
    const uniqueId = uuidv4();
    const fileExtension = path.extname(originalName);
    return `${uniqueId}${fileExtension}`;
  }

  public createFileMetadata(
    file: Express.Multer.File,
    userId?: string,
    description?: string
  ): FileMetadata {
    return {
      id: uuidv4(),
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId || 'anonymous',
      description: description || '',
    };
  }

  public getFileInfo(filename: string): FileInfo | null {
    const filePath = path.join(this.uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    return {
      filename: filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }

  public getFilePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  public fileExists(filename: string): boolean {
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }

  public deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  public deleteFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      this.deleteFile(filePath);
    });
  }

  public getUploadsDirectory(): string {
    return this.uploadsDir;
  }
}
