import { createClient, RedisClientType } from 'redis';
import { Config } from '../../interface/common.interface';
import { RedisStore } from 'connect-redis';
import { SecretManager } from './secret-manager.client';

export class RedisConnection {
  private static instance: RedisConnection;
  private secretManager: SecretManager;
  private redisClient: RedisClientType | null = null;

  private constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  static getInstance(config: Config): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection(config);
    }
    return RedisConnection.instance;
  }

  async getClient() {
    if (this.redisClient) {
      return this.redisClient;
    }

    const url = await this.secretManager.get('REDIS_URL');

    this.redisClient = createClient({ url });

    await this.redisClient.connect();

    this.redisClient.on('connect', () => {
      console.info('Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    return this.redisClient;
  }

  async getStore(): Promise<RedisStore> {
    try {
      const redisClient = await this.getClient();

      return new RedisStore({
        client: redisClient,
        prefix: 'myapp:',
      });
    } catch (err) {
      console.error('Redis store initialization failed:', err);
      throw err;
    }
  }

  async closeConnection() {
    try {
      const redisClient = await this.getClient();

      await redisClient.quit();
    } catch (err) {
      console.error('Redis connection close failed:', err);
      throw err;
    }
  }
}

