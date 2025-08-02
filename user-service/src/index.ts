import { Server } from './server';

async function main(): Promise<void> {
  const server = Server.getInstance();

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    await server.shutdown();
  });

  process.on('SIGTERM', async () => {
    await server.shutdown();
  });

  // Start the server
  await server.start();
}

// Run the application
main().catch((error) => {
  console.error(' Application failed to start:', error);
  process.exit(1);
});
