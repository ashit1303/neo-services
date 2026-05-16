import mongoose, { ConnectOptions } from 'mongoose';
import { DatabaseConfigManager } from './all-db-config';
import { initializeDefaultRoles, initializeDefaultUsers } from '../../seed-defaults';
import { Config } from '../../interface/common.interface';

export class MongooseClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async connect(): Promise<void> {
    const uri = await new DatabaseConfigManager(this.config).getMongoUri();
    const options: ConnectOptions = {
      sanitizeFilter: true,
      maxPoolSize: 20,
    };

    try {
      await mongoose.connect(uri, options);
      console.info('✅ MongoDB Connected Successfully');
      await initializeDefaultRoles();
      await initializeDefaultUsers();
    } catch (error: any) {
      console.error('❌ MongoDB Connection Failed', error);
      process.exit(1);
    }
  }

  async close(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.info('📡 MongoDB Connection Closed');
    } catch (error: any) {
      console.error('❌ Error Closing MongoDB Connection', error);
    }
  }
}

