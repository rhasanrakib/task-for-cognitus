import { Router } from 'express';
import { FileController } from '../modules/file-controller/file.controller';
import { UploadMiddleware } from '../middleware/upload.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';

export class FileRoutes {
  public router: Router;
  private fileController: FileController;
  private uploadMiddleware: UploadMiddleware;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.fileController = FileController.getInstance();
    this.uploadMiddleware = UploadMiddleware.getInstance();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public health check endpoint
    // Protected file operations - require authentication
    this.router.post(
      '/files/upload',
      this.authMiddleware.authenticate,
      this.uploadMiddleware.single('file'),
      this.fileController.uploadSingle.bind(this.fileController)
    );

    this.router.get(
      '/files/:filename',
      this.authMiddleware.authenticate,
      this.fileController.getFileInfo.bind(this.fileController)
    );

    this.router.get(
      '/files/download/:filename',
      this.authMiddleware.authenticate,
      this.fileController.downloadFile.bind(this.fileController)
    );
  }
}
