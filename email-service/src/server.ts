import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { NotificationProcessorService } from './services/notification-processor.service';

class Server {
  public app: express.Application;
  private notificationProcessor: NotificationProcessorService;

  constructor() {
    this.app = express();
    this.notificationProcessor = new NotificationProcessorService();
    this.initializeMiddleware();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS
    this.app.use(cors());
    
    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }


  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: express.Request, res: express.Response) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize notification processor (Kafka consumer)
      await this.notificationProcessor.initialize();
      
      // Start Express server
      this.app.listen(config.app.port, () => {
        console.log(` Email Service started successfully!`);
        console.log(`Server running on port ${config.app.port}`);
        console.log(`Health check: http://localhost:${config.app.port}/api/health`);
        console.log(`Listening for notifications from: ${config.kafka.notificationTopic}`);
        console.log(`Kafka Consumer Group: ${config.kafka.groupId}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      console.error('Failed to start Email Service:', error);
      process.exit(1);
    }
  }

  

  private async shutdown(): Promise<void> {
    console.log('\Shutting down Email Service gracefully...');
    try {
      await this.notificationProcessor.shutdown();
      console.log('Email Service shut down successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

export default Server;
