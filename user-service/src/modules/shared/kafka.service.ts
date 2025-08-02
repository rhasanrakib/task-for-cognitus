import { Kafka, Producer } from 'kafkajs';
import { KafkaConfig, KafkaMessage, ProducerConfig } from '../../types/kafka.type';
import { FileMetadata } from '../../types/file-metadata.type';
import { ConfigService } from '../../config/config.service';

export class KafkaService {
  private static instance: KafkaService;
  private kafka!: Kafka;
  private producer!: Producer;
  private isConnected: boolean = false;
  private config: ConfigService;

  private constructor() {
    this.config = ConfigService.getInstance();
    this.initializeKafka();
  }

  public static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  private initializeKafka(): void {
    const kafkaConfig = this.config.getKafkaConfig();
    
    const config: KafkaConfig = {
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers.split(','),
      connectionTimeout: 30000,
      requestTimeout: 30000,
    };

    this.kafka = new Kafka(config);

    const producerConfig: ProducerConfig = {
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    };

    this.producer = this.kafka.producer(producerConfig);
  }

  public async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected successfully');
    } catch (error) {
      console.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.producer.disconnect();
        this.isConnected = false;
        console.log('Kafka producer disconnected');
      }
    } catch (error) {
      console.error(' Error disconnecting from Kafka:', error);
      throw error;
    }
  }

  public async sendFileMetadata(fileMetadata: FileMetadata): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Kafka producer is not connected');
      }

      const kafkaConfig = this.config.getKafkaConfig();
      
      await this.producer.send({
        topic: kafkaConfig.topic,
        messages: [{
          key: fileMetadata.id,
          value: JSON.stringify(fileMetadata),
        }],
      });
      
      console.log('File metadata sent to Kafka:', fileMetadata.id);
      return true;
    } catch (error) {
      console.error('Failed to send to Kafka:', error);
      throw error;
    }
  }

  public isProducerConnected(): boolean {
    return this.isConnected;
  }
}
