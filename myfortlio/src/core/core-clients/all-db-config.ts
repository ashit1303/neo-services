import { Config, DatabaseConfig } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';

export class DatabaseConfigManager {
  private secretManager: SecretManager;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  async fetchDbConfig(): Promise<DatabaseConfig> {
    const secrets = await this.secretManager.fetchAll();

    const dbConfig: DatabaseConfig = {
      cluster: secrets['DB_CLUSTER'],
      password: secrets['DB_PASSWORD'],
      username: secrets['DB_USERNAME'],
      dbName: secrets['DB_NAME'],
    };

    return dbConfig;
  }

  async getClickHouseConfig(): Promise<DatabaseConfig> {
    const secrets = await this.secretManager.get('CLICKHOUSE_CONFIG').then((res) => JSON.parse(res));
    const dbConfig: DatabaseConfig = {
      cluster: secrets['CH_LOGS_DB_CLUSTER'],
      password: secrets['CH_LOGS_DB_PASSWORD'],
      username: secrets['CH_LOGS_DB_USERNAME'],
      dbName: secrets['CH_LOGS_DB_NAME'],
    };

    return dbConfig;
  }

  async getMongoUri(): Promise<string> {
    // if (process.env.BUN_ENV === 'local') {
    //   return 'mongodb://localhost:27017/myfortlio-local';
    // }
    const dbConfig = await this.fetchDbConfig();
    return `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.cluster}/${dbConfig.dbName}?retryWrites=true&w=majority`;
  }

}