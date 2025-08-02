export type KafkaConfig = {
  clientId: string;
  brokers: string[];
  connectionTimeout: number;
  requestTimeout: number;
}

export type KafkaMessage = {
  topic: string;
  messages: Array<{
    key: string;
    value: string;
    timestamp?: string;
  }>;
}

export type ProducerConfig = {
  maxInFlightRequests: number;
  idempotent: boolean;
  transactionTimeout: number;
}
