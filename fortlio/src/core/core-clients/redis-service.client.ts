import { Config } from '../../interface/common.interface';
import { AppError } from '../core-utils/err-util';
import { RedisConnection } from './redis-connection.client';

export class RedisService {
  private redisConnection: RedisConnection;

  constructor(config: Config) {
    this.redisConnection = RedisConnection.getInstance(config);
  }

  async set(key: string, value: string, expiration: number): Promise<void> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    await redisClient.set(key, value, {
      EX: expiration,
    });
  }

  async get(key: string): Promise<string | null> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return data;
  }

  async delete(key: string): Promise<void> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    await redisClient.del(key);
  }

  async refresh(key: string, updatedValue: string, expiration: number): Promise<void> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    await this.delete(key);

    await redisClient.set(key, updatedValue, {
      EX: expiration,
    });
  }

  async addToSet(key: string, value: string, expiration: number): Promise<void> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    await redisClient.sAdd(key, value); // Add value to Redis set

    if (expiration) {
      await redisClient.expire(key, expiration); // Set expiration for the key
    }
  }

  async createSet(key: string, values: string[], expiration: number): Promise<void> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    await redisClient.sAdd(key, values); // Add values to Redis set

    if (expiration) {
      await redisClient.expire(key, expiration); // Set expiration for the key
    }
  }

  async getSetMembers(key: string): Promise<string[] | null> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    const members = await redisClient.sMembers(key); // Get all members of the set

    return members.length > 0 ? members : null;
  }

  async removeFromSet(key: string, value: string): Promise<void> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }

    await redisClient.sRem(key, value); // Remove specific value from the set
  }

  async isSetMember(key: string, value: string): Promise<boolean> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }
    const exists = await redisClient.sIsMember(key, value); // Check if the value exists in the set
    return Boolean(exists);
  }

  async isKeyExists(key: string): Promise<boolean> {
    const redisClient = await this.redisConnection.getClient();

    if (!redisClient) {
      throw new AppError('Redis client not initialized');
    }
    const exists = await redisClient.exists(key); // Check if the value exists in the set
    return Boolean(exists);
  }
}
