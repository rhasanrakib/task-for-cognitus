import 'dotenv/config';
import Server from './server';

async function main() {
  try {
    console.log('Starting Email Notification Service...');
    console.log('==================================================');

    const server = new Server();
    await server.start();
  } catch (error) {
    console.error('Email Service startup failed:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();
