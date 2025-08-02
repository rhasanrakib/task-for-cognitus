import { EachMessagePayload } from 'kafkajs';
import { KafkaService } from './kafka.service';
import { ExcelProcessorService } from './excel-processor.service';
import { IptvUserService } from './iptv-user.service';
import { DatabaseService } from './database.service';
import { FileUploadEvent, NotificationEvent } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { IIptvUserDocument } from '../models/iptv-user.model';

export class FileProcessingService {
  private kafkaService: KafkaService;
  private excelProcessor: ExcelProcessorService;
  private iptvUserService: IptvUserService;
  private databaseService: DatabaseService;

  constructor() {
    this.kafkaService = KafkaService.getInstance();
    this.excelProcessor = new ExcelProcessorService();
    this.iptvUserService = new IptvUserService();
    this.databaseService = DatabaseService.getInstance();
  }

  public async initialize(): Promise<void> {
    try {
      // Connect to database
      await this.databaseService.connect();
      
      // Connect to Kafka
      await this.kafkaService.connect();
      
      // Subscribe to file upload events
      await this.kafkaService.subscribe(this.handleFileUploadEvent.bind(this));
      
      console.log('File processing service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize file processing service:', error);
      throw error;
    }
  }

  private async handleFileUploadEvent(payload: EachMessagePayload): Promise<void> {
    console.log('Processing file upload event...');
    
    if (!payload.message.value) {
      throw new Error('Empty message received');
    }

    // Parse the file upload event
    const fileEvent = this.kafkaService.parseFileUploadEvent(payload.message.value);
    
    console.log(`Processing file: ${fileEvent.fileName} (ID: ${fileEvent.fileId})`);
    
    // Check if it's an Excel file
    if (!this.isExcelFile(fileEvent.fileName, fileEvent.mimeType)) {
      console.log(`File ${fileEvent.fileName} is not an Excel file, skipping...`);
      return;
    }

    try {
      // Check if file exists
      if (!fs.existsSync(fileEvent.filePath)) {
        throw new Error(`File not found: ${fileEvent.filePath}`);
      }

      // Process Excel file
      const users = this.excelProcessor.processExcelFile(fileEvent.filePath);
      console.log(`Extracted ${users.length} users from Excel file`);

      if (users.length === 0) {
        throw new Error('No valid users found in Excel file');
      }

      // Save users to database
      const result = await this.iptvUserService.createUsers(users);
      
      console.log(`Successfully processed ${result.successful} users, ${result.failed.length} failed`);

      // Send success notification
      for (const element of result.successful) {
        await this.sendSuccessNotification(fileEvent, element);
      }

      // Log failed records if any
      for (const failedRecord of result.failed) {
        console.error('Failed to process record:', failedRecord);
      }

    } catch (error: any) {
      console.error(`Error processing file ${fileEvent.fileName}:`, error);
      
      // Send error notification
      throw error;
    }
  }

  private isExcelFile(fileName: string, mimeType: string): boolean {
    const excelExtensions = ['.xlsx', '.xls', '.xlsm'];
    const excelMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];

    const fileExtension = path.extname(fileName).toLowerCase();
    return excelExtensions.includes(fileExtension) || excelMimeTypes.includes(mimeType);
  }

  private async sendSuccessNotification(
    fileEvent: FileUploadEvent, 
    user: IIptvUserDocument,
  ): Promise<void> {
    const notification: NotificationEvent = {
      type: 'account_created',
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      processedAt: new Date().toISOString(),
    };

    await this.kafkaService.sendNotification(notification);
  }

  public async shutdown(): Promise<void> {
    try {
      await this.kafkaService.disconnect();
      await this.databaseService.disconnect();
      console.log('File processing service shut down successfully');
    } catch (error) {
      console.error('Error during shutdown:', error);
      throw error;
    }
  }
}
