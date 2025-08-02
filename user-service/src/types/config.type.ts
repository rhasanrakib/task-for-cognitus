export type AppConfig = {
  port: number;
  uploadsDir: string;
  maxFileSize: number;
  maxFiles: number;
}

export type AuthConfig = {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
}

export type DatabaseConfig = {
  uri: string;
  dbName: string;
}

export type ServerConfig = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  kafka: {
    clientId: string;
    brokers: string;
    topic: string;
  };
}
