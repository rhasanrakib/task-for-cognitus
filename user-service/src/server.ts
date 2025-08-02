import express, { Application } from 'express';
import cors from 'cors';
import { ConfigService } from './config/config.service';
import { DatabaseService } from './modules/shared/database.service';
import { KafkaService } from './modules/shared/kafka.service';
import { FileRoutes } from './routes/file-routes';
import { UserRoutes } from './routes/user-routes';
import { ErrorMiddleware } from './middleware/error.middleware';

export class Server {
  private static instance: Server;
  private app: Application;
  private config: ConfigService;
  private databaseService: DatabaseService;
  private kafkaService: KafkaService;
  private fileRoutes: FileRoutes;
  private userRoutes: UserRoutes;

  private constructor() {
    this.app = express();
    this.config = ConfigService.getInstance();
    this.databaseService = DatabaseService.getInstance();
    this.kafkaService = KafkaService.getInstance();
    this.fileRoutes = new FileRoutes();
    this.userRoutes = new UserRoutes();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  public static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }
    return Server.instance;
  }

  private initializeMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private initializeRoutes(): void {
    this.app.use('/api', this.fileRoutes.router);
    this.app.use('/api', this.userRoutes.router);
    
    // Root health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'User service is healthy',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorMiddleware.handle);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await this.databaseService.connect();
      
      // Initialize Kafka connection
      await this.kafkaService.connect();
      
      const appConfig = this.config.getAppConfig();
      const kafkaConfig = this.config.getKafkaConfig();
      const dbConfig = this.config.getDatabaseConfig();
      
      this.app.listen(appConfig.port, () => {
        console.log(`User service running on port ${appConfig.port}`);
        console.log(`Upload directory: ${appConfig.uploadsDir}`);
        console.log(`Database: ${dbConfig.dbName}`);
        console.log(`Kafka topic: ${kafkaConfig.topic}`);
        console.log(`Kafka brokers: ${kafkaConfig.brokers}`);
        console.log(`JWT Auth enabled`);
      });
    } catch (error) {
      console.error(' Failed to start server:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down gracefully...');
    try {
      await this.databaseService.disconnect();
      await this.kafkaService.disconnect();
      console.log('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error(' Error during shutdown:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}
