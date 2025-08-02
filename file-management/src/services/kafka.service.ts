import { Kafka, Consumer, Producer, EachMessagePayload } from 'kafkajs';
import { config } from '../config/config';
import { FileUploadEvent, NotificationEvent } from '../types';

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private static instance: KafkaService;

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
      groupId: `${config.kafka.clientId}-group`,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
    
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  public static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.producer.connect();
      console.log('Kafka producer connected');
      
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
      await this.producer.disconnect();
      console.log('Kafka disconnected');
    } catch (error) {
      console.error('Error disconnecting from Kafka:', error);
      throw error;
    }
  }

  public async subscribe(messageHandler: (payload: EachMessagePayload) => Promise<void>): Promise<void> {
    try {
      await this.consumer.subscribe({ 
        topic: config.kafka.topic,
        fromBeginning: false 
      });
      
      console.log(`Subscribed to topic: ${config.kafka.topic}`);
      
      await this.consumer.run({
        eachMessage: async (payload) => {
          try {
            console.log(`Received message from topic ${payload.topic} partition ${payload.partition}`);
            await messageHandler(payload);
          } catch (error) {
            console.error('Error processing message:', error);
          }
        },
      });
    } catch (error) {
      console.error('Error subscribing to Kafka topic:', error);
      throw error;
    }
  }

  public async sendNotification(notification: NotificationEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: config.kafka.notificationTopic,
        messages: [
          {
            key: notification.userId,
            value: JSON.stringify(notification),
            timestamp: Date.now().toString(),
          },
        ],
      });
      
      console.log(`Notification sent for file ${notification.userId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  public parseFileUploadEvent(messageValue: Buffer): FileUploadEvent {
    try {
      const eventData = JSON.parse(messageValue.toString());
      return eventData as FileUploadEvent;
    } catch (error) {
      console.error('Error parsing file upload event:', error);
      throw new Error('Invalid message format');
    }
  }
}
