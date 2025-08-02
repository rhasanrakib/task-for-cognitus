import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ErrorResponse } from '../types/file-metadata.type';

export class ErrorMiddleware {
  public static handle(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const response: ErrorResponse = {
          error: 'File too large',
          message: 'File size exceeds the maximum limit',
        };
        res.status(400).json(response);
        return;
      }
      
      if (error.code === 'LIMIT_FILE_COUNT') {
        const response: ErrorResponse = {
          error: 'Too many files',
          message: 'Number of files exceeds the maximum limit',
        };
        res.status(400).json(response);
        return;
      }
    }

    console.error('Unhandled error:', error);
    const response: ErrorResponse = {
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      details: error.message,
    };
    res.status(500).json(response);
  }
}
