import multer from 'multer';
import { Request } from 'express';
import { FileService } from '../modules/file-controller/file.service';
import { ConfigService } from '../config/config.service';

export class UploadMiddleware {
  private static instance: UploadMiddleware;
  private fileService: FileService;
  private config: ConfigService;
  private upload!: multer.Multer;

  private constructor() {
    this.fileService = FileService.getInstance();
    this.config = ConfigService.getInstance();
    this.setupMulter();
  }

  public static getInstance(): UploadMiddleware {
    if (!UploadMiddleware.instance) {
      UploadMiddleware.instance = new UploadMiddleware();
    }
    return UploadMiddleware.instance;
  }

  private setupMulter(): void {
    const appConfig = this.config.getAppConfig();
    
    const storage = multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, appConfig.uploadsDir);
      },
      filename: (req: Request, file: Express.Multer.File, cb: Function) => {
        const fileName = this.fileService.generateFileName(file.originalname);
        cb(null, fileName);
      },
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: appConfig.maxFileSize,
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
        // Accept all file types - you can add specific filtering here
        cb(null, true);
      },
    });
  }

  public single(fieldName: string) {
    return this.upload.single(fieldName);
  }

  public array(fieldName: string, maxCount?: number) {
    const maxFiles = maxCount || this.config.getAppConfig().maxFiles;
    return this.upload.array(fieldName, maxFiles);
  }

  public getMulter(): multer.Multer {
    return this.upload;
  }
}
