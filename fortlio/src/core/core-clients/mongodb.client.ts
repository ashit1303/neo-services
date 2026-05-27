import { MongoClient, Db, ClientSession } from 'mongodb';
import { DatabaseConfigManager } from './all-db-config';
import { Config } from '../../interface/common.interface';
import { AppError } from '../core-utils/err-util';

export class MongoDBClient {
  private commonClient?: MongoClient;
  // private logsClient?: MongoClient;
  private commonDb?: Db;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private getOptions() {
    return {
      maxPoolSize: 20, // pool of 20
      maxIdleTimeMS: 30000, // 30 seconds
    };
  }

  async connect(): Promise<Db> {
    if (!this.commonDb) {
      const uri = await new DatabaseConfigManager(this.config).getMongoUri();
      this.commonClient = new MongoClient(uri, this.getOptions());
      await this.commonClient.connect();

      console.info('✅ MongoDB Client Connected to Common DB Successfully');

      this.commonDb = this.commonClient.db();
    }
    return this.commonDb;
  }

  async startSession(): Promise<ClientSession> {
    await this.connect(); // Ensure client is connected
    if (!this.commonClient) {
      throw new AppError('Failed to initialize MongoDB client');
    }
    return this.commonClient.startSession();
  }

  async close(): Promise<void> {
    if (this.commonClient) {
      this.commonClient.close();
      console.info('📡 MongoDB Client Connection Closed for Common DB');
    }
    // if (this.logsClient) {
    //   this.logsClient.close();
    //   console.info('📡 MongoDB Client Connection Closed for Logs DB');
    // }
  }
}
