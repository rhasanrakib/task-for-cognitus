import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { FileProcessingService } from './services/file-processing.service';
import iptvUserRoutes from './routes/iptv-user.routes';

class App {
  public app: express.Application;
  private fileProcessingService: FileProcessingService;

  constructor() {
    this.app = express();
    this.fileProcessingService = new FileProcessingService();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS
    this.app.use(cors());
    
    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        service: 'file-management',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api', iptvUserRoutes);
    
    // Root route
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: 'File Management Service',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          users: '/api/users',
          userStats: '/api/users/stats'
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
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
      // Initialize file processing service (Kafka consumer + Database)
      await this.fileProcessingService.initialize();
      
      // Start Express server
      this.app.listen(config.app.port, () => {
        console.log(`File Management Service started on port ${config.app.port}`);
        console.log(`Health check: http://localhost:${config.app.port}/health`);
        console.log(`API docs: http://localhost:${config.app.port}/`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    console.log('Shutting down gracefully...');
    try {
      await this.fileProcessingService.shutdown();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

export default App;
