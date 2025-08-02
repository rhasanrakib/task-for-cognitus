import request from 'supertest';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FileController } from '../src/modules/file-controller/file.controller';
import { FileService } from '../src/modules/file-controller/file.service';
import { UploadMiddleware } from '../src/middleware/upload.middleware';
import { ConfigService } from '../src/config/config.service';

// Mock the entire Kafka service module
jest.mock('../src/modules/shared/kafka.service', () => {
  return {
    KafkaService: {
      getInstance: jest.fn(() => ({
        sendFileMetadata: jest.fn().mockResolvedValue(true),
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        isProducerConnected: jest.fn().mockReturnValue(true),
      })),
    },
  };
});

describe('File Upload Functionality Tests', () => {
  let app: express.Application;
  let fileController: FileController;
  let fileService: FileService;
  let uploadMiddleware: UploadMiddleware;
  let testUploadsDir: string;

  // Sample test file content
  const testFileContent = 'This is a test file content for upload testing';
  const testFileName = 'test-file.txt';

  beforeAll(() => {
    // Setup test environment
    testUploadsDir = path.join(__dirname, '../uploads/test');
    
    // Mock ConfigService to return test configuration
    jest.spyOn(ConfigService.prototype, 'getAppConfig').mockReturnValue({
      port: 3001,
      uploadsDir: testUploadsDir,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    });

    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Initialize services
    fileController = FileController.getInstance();
    fileService = FileService.getInstance();
    uploadMiddleware = UploadMiddleware.getInstance();

    // Setup test routes without authentication for testing
    app.post('/upload', 
      uploadMiddleware.single('file'),
      fileController.uploadSingle.bind(fileController)
    );
    
    app.get('/file/:filename',
      fileController.getFileInfo.bind(fileController)
    );

    app.get('/download/:filename',
      fileController.downloadFile.bind(fileController)
    );
  });

  beforeEach(() => {
    // Ensure test uploads directory exists
    if (!fs.existsSync(testUploadsDir)) {
      fs.mkdirSync(testUploadsDir, { recursive: true });
    }

    // Clear test uploads directory before each test
    const files = fs.readdirSync(testUploadsDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(testUploadsDir, file));
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Cleanup test uploads directory
    if (fs.existsSync(testUploadsDir)) {
      fs.rmSync(testUploadsDir, { recursive: true, force: true });
    }
  });

  describe('POST /upload - File Upload', () => {
    it('should successfully upload a file', async () => {
      const response = await request(app)
        .post('/upload')
        .field('userId', 'test-user-123')
        .field('description', 'Test file upload')
        .attach('file', Buffer.from(testFileContent), testFileName);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('File uploaded and sent to Kafka successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('originalName', testFileName);
      expect(response.body.data).toHaveProperty('size', testFileContent.length);
      expect(response.body.data).toHaveProperty('mimeType', 'text/plain');
      expect(response.body.data).toHaveProperty('uploadedAt');

      // Verify file was actually saved
      const files = fs.readdirSync(testUploadsDir);
      expect(files.length).toBe(1);
    });

    it('should return error when no file is uploaded', async () => {
      const response = await request(app)
        .post('/upload')
        .field('userId', 'test-user-123')
        .field('description', 'Test without file');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No file uploaded');
      expect(response.body.message).toBe('Please select a file to upload');
    });

    it('should handle file upload without optional fields', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', Buffer.from(testFileContent), testFileName);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalName).toBe(testFileName);
    });

    it('should handle large file upload within size limit', async () => {
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB file
      const response = await request(app)
        .post('/upload')
        .field('userId', 'test-user-123')
        .attach('file', Buffer.from(largeContent), 'large-file.txt');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.size).toBe(largeContent.length);
    });

    it('should reject file upload exceeding size limit', async () => {
      // Create a file larger than 5MB limit
      const oversizedContent = 'x'.repeat(6 * 1024 * 1024); // 6MB file
      const response = await request(app)
        .post('/upload')
        .attach('file', Buffer.from(oversizedContent), 'oversized-file.txt');

      // Multer middleware should reject large files
      expect(response.status).toBe(500);
    });

    it('should upload different file types correctly', async () => {
      const testFiles = [
        { content: testFileContent, name: 'test.txt', mimeType: 'text/plain' },
        { content: JSON.stringify({ test: 'data' }), name: 'test.json', mimeType: 'application/json' },
        { content: '<html><body>Test</body></html>', name: 'test.html', mimeType: 'text/html' }
      ];

      for (const testFile of testFiles) {
        // Clear directory before each upload
        const files = fs.readdirSync(testUploadsDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(testUploadsDir, file));
        });

        const response = await request(app)
          .post('/upload')
          .field('userId', 'test-user-123')
          .attach('file', Buffer.from(testFile.content), testFile.name);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.originalName).toBe(testFile.name);
        expect(response.body.data.mimeType).toBe(testFile.mimeType);
      }
    });
  });

  describe('GET /file/:filename - File Info', () => {
    let uploadedFileName: string;

    beforeEach(async () => {
      // Upload a test file first
      await request(app)
        .post('/upload')
        .field('userId', 'test-user-123')
        .attach('file', Buffer.from(testFileContent), testFileName);

      // Extract the actual filename from file system
      const files = fs.readdirSync(testUploadsDir);
      uploadedFileName = files[0];
    });

    it('should return file information for existing file', async () => {
      const response = await request(app)
        .get(`/file/${uploadedFileName}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filename', uploadedFileName);
      expect(response.body).toHaveProperty('size', testFileContent.length);
      expect(response.body).toHaveProperty('created');
      expect(response.body).toHaveProperty('modified');
    });

    it('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/file/non-existent-file.txt');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('File not found');
      expect(response.body.message).toBe('The requested file does not exist');
    });
  });

  describe('GET /download/:filename - File Download', () => {
    let uploadedFileName: string;

    beforeEach(async () => {
      // Upload a test file first
      await request(app)
        .post('/upload')
        .field('userId', 'test-user-123')
        .attach('file', Buffer.from(testFileContent), testFileName);

      // Extract the actual filename from file system
      const files = fs.readdirSync(testUploadsDir);
      uploadedFileName = files[0];
    });

    it('should download existing file', async () => {
      const response = await request(app)
        .get(`/download/${uploadedFileName}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe(testFileContent);
    });

    it('should return 404 for non-existent file download', async () => {
      const response = await request(app)
        .get('/download/non-existent-file.txt');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('File not found');
      expect(response.body.message).toBe('The requested file does not exist');
    });
  });

  describe('FileService - Core Functionality', () => {
    it('should generate unique file names', () => {
      const originalName = 'test-file.txt';
      const fileName1 = fileService.generateFileName(originalName);
      const fileName2 = fileService.generateFileName(originalName);

      expect(fileName1).not.toBe(fileName2);
      expect(fileName1).toMatch(/^[a-f0-9-]+\.txt$/);
      expect(fileName2).toMatch(/^[a-f0-9-]+\.txt$/);
    });

    it('should create file metadata correctly', () => {
      const mockFile = {
        originalname: testFileName,
        filename: 'generated-filename.txt',
        path: '/test/path/generated-filename.txt',
        size: testFileContent.length,
        mimetype: 'text/plain'
      } as Express.Multer.File;

      const metadata = fileService.createFileMetadata(mockFile, 'test-user', 'test description');

      expect(metadata).toHaveProperty('id');
      expect(metadata.originalName).toBe(testFileName);
      expect(metadata.fileName).toBe('generated-filename.txt');
      expect(metadata.filePath).toBe('/test/path/generated-filename.txt');
      expect(metadata.size).toBe(testFileContent.length);
      expect(metadata.mimeType).toBe('text/plain');
      expect(metadata.uploadedBy).toBe('test-user');
      expect(metadata.description).toBe('test description');
      expect(metadata).toHaveProperty('uploadedAt');
    });

    it('should handle anonymous user metadata', () => {
      const mockFile = {
        originalname: testFileName,
        filename: 'generated-filename.txt',
        path: '/test/path/generated-filename.txt',
        size: testFileContent.length,
        mimetype: 'text/plain'
      } as Express.Multer.File;

      const metadata = fileService.createFileMetadata(mockFile);

      expect(metadata.uploadedBy).toBe('anonymous');
      expect(metadata.description).toBe('');
    });

    it('should check file existence correctly', () => {
      // Create a test file
      const testFilePath = path.join(testUploadsDir, 'test-existence.txt');
      fs.writeFileSync(testFilePath, 'test content');

      expect(fileService.fileExists('test-existence.txt')).toBe(true);
      expect(fileService.fileExists('non-existent-file.txt')).toBe(false);

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it('should delete files correctly', () => {
      // Create a test file
      const testFilePath = path.join(testUploadsDir, 'test-delete.txt');
      fs.writeFileSync(testFilePath, 'test content');

      expect(fs.existsSync(testFilePath)).toBe(true);

      fileService.deleteFile(testFilePath);

      expect(fs.existsSync(testFilePath)).toBe(false);
    });

    it('should get file path correctly', () => {
      const filename = 'test-file.txt';
      const expectedPath = path.join(testUploadsDir, filename);
      const actualPath = fileService.getFilePath(filename);

      expect(actualPath).toBe(expectedPath);
    });

    it('should get uploads directory correctly', () => {
      const uploadsDir = fileService.getUploadsDirectory();
      expect(uploadsDir).toBe(testUploadsDir);
    });
  });
});
