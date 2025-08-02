import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '../config/config';
import { NotificationEvent } from '../types';

export class KafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private static instance: KafkaConsumerService;

  private constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
      },
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: config.kafka.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  public static getInstance(): KafkaConsumerService {
    if (!KafkaConsumerService.instance) {
      KafkaConsumerService.instance = new KafkaConsumerService();
    }
    return KafkaConsumerService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      console.log('Kafka consumer connected');
    } catch (error) {
      console.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log('Kafka consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting from Kafka:', error);
      throw error;
    }
  }

  public async subscribe(messageHandler: (notification: NotificationEvent) => Promise<void>): Promise<void> {
    try {
      await this.consumer.subscribe({ 
        topic: config.kafka.notificationTopic,
        fromBeginning: false 
      });

      console.log(`Subscribed to topic: ${config.kafka.notificationTopic}`);
      console.log(`Email service is now listening for file processing notifications...`);

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            console.log(`\nReceived notification from topic ${payload.topic} partition ${payload.partition}`);

            if (!payload.message.value) {
              console.warn('Empty message received, skipping...');
              return;
            }

            const notification = this.parseNotificationEvent(payload.message.value);
            console.log(`Notification type: ${notification.type} for user: ${notification.name}`);
            
            await messageHandler(notification);
          } catch (error: any) {
            console.error('Error processing notification message:', error.message);
            // Don't throw here to prevent consumer from stopping
          }
        },
      });
    } catch (error) {
      console.error('Error subscribing to Kafka topic:', error);
      throw error;
    }
  }

  private parseNotificationEvent(messageValue: Buffer): NotificationEvent {
    try {
      const eventData = JSON.parse(messageValue.toString());
      
      // Validate required fields
      if (!eventData.email || !eventData.userId || !eventData.name || !eventData.processedAt) {
        throw new Error('Invalid notification format: missing required fields');
      }

      return eventData as NotificationEvent;
    } catch (error: any) {
      console.error('Error parsing notification event:', error.message);
      throw new Error(`Invalid message format: ${error.message}`);
    }
  }

  public async getConsumerInfo(): Promise<any> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const topics = await admin.listTopics();
      console.log('📋 Available topics:', topics);
      
      await admin.disconnect();
      
      return {
        clientId: config.kafka.clientId,
        groupId: config.kafka.groupId,
        brokers: config.kafka.brokers,
        subscribedTopic: config.kafka.notificationTopic,
        availableTopics: topics
      };
    } catch (error: any) {
      console.error('Error getting consumer info:', error.message);
      throw error;
    }
  }
}
