import * as fs from 'fs';
import * as path from 'path';

// Setup test environment
beforeAll(() => {
  // Create test uploads directory
  const testUploadsDir = path.join(__dirname, '../uploads/test');
  if (!fs.existsSync(testUploadsDir)) {
    fs.mkdirSync(testUploadsDir, { recursive: true });
  }
});

afterAll(() => {
  // Cleanup test uploads directory
  const testUploadsDir = path.join(__dirname, '../uploads/test');
  if (fs.existsSync(testUploadsDir)) {
    fs.rmSync(testUploadsDir, { recursive: true, force: true });
  }
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.UPLOADS_DIR = path.join(__dirname, '../uploads/test');
process.env.MAX_FILE_SIZE = '5242880'; // 5MB
process.env.JWT_SECRET = 'test-jwt-secret';
