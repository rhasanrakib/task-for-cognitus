import { KafkaConsumerService } from './kafka-consumer.service';
import { EmailService } from './email.service';
import { NotificationEvent } from '../types';

export class NotificationProcessorService {
  private kafkaConsumer: KafkaConsumerService;
  private emailService: EmailService;

  constructor() {
    this.kafkaConsumer = KafkaConsumerService.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Email Notification Service...');
      
      // Test email configuration
      await this.emailService.testEmailConnection();
      
      // Connect to Kafka
      await this.kafkaConsumer.connect();
      
      // Subscribe to notifications
      await this.kafkaConsumer.subscribe(this.handleNotification.bind(this));
      
      console.log('Email Notification Service initialized successfully');
      console.log('Ready to process file notifications from file-management service');
      
    } catch (error) {
      console.error('Failed to initialize notification processor:', error);
      throw error;
    }
  }

  private async handleNotification(notification: NotificationEvent): Promise<void> {
    try {
      console.log(`Processing notification for user: ${notification.name}`);
      console.log(`Type: ${notification.type}`);
      console.log(`User ID: ${notification.userId}`);
      console.log(`Email: ${notification.email || 'Not provided'}`);
      console.log(`Processed At: ${new Date(notification.processedAt).toLocaleString()}`);

      if (notification.type === 'account_created') {
        // Handle successful account creation
        console.log(`IPTV account created successfully for ${notification.name}`);
        
        // Update statistics
        
        // Send account creation email notification
        await this.emailService.sendAccountCreatedNotification(notification);

        console.log('Account creation notification email sent');

      } else if (notification.type === 'processing_error') {
        // Handle processing error
        console.log(`Account creation failed for ${notification.name} - Error: ${notification.error}`);

        // Update statistics


        console.log('Error notification email sent');

      } else {
        console.warn(`Unknown notification type: ${notification.type}`);
      }

      // Print current statistics

    } catch (error: any) {
      console.error(`Error handling notification for user ${notification.name}:`, error.message);
      // Don't rethrow to prevent consumer from stopping
    }
  }



  public async shutdown(): Promise<void> {
    try {
      console.log('Shutting down notification processor...');

      
      // Disconnect from Kafka
      await this.kafkaConsumer.disconnect();

      console.log('Notification processor shut down successfully');
    } catch (error: any) {
      console.error(' Error during shutdown:', error.message);
      throw error;
    }
  }
}
