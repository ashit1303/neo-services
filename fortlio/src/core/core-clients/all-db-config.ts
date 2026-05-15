import { Config, DatabaseConfig } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';

export class DatabaseConfigManager {
  private secretManager: SecretManager;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  async fetchDbConfig(): Promise<DatabaseConfig> {
    const secrets = await this.secretManager.get('MONGO_BASE_CONFIG').then((res) => JSON.parse(res));

    const dbConfig: DatabaseConfig = {
      cluster: secrets['CLUSTER'],
      password: secrets['PASSWORD'],
      username: secrets['USERNAME'],
      dbName: secrets['NAME'],
    };

    return dbConfig;
  }

  async getClickHouseConfig(): Promise<DatabaseConfig> {
    const secrets = await this.secretManager.get('CLICKHOUSE_CONFIG').then((res) => JSON.parse(res));
    const dbConfig: DatabaseConfig = {
      cluster: secrets['CLUSTER'],
      password: secrets['PASSWORD'],
      username: secrets['USERNAME'],
      dbName: secrets['NAME'],
    };

    return dbConfig;
  }

  async getMongoUri(): Promise<string> {
    // if (process.env.BUN_ENV === 'local') {
    //   return 'mongodb://localhost:27017/fortlio-local';
    // }
    const dbConfig = await this.fetchDbConfig();
    return `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.cluster}/${dbConfig.dbName}?retryWrites=true&w=majority`;
  }

}