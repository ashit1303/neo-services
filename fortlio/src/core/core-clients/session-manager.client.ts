import { config } from '../../../config';
import { RedisService } from './redis-service.client';
import { ACCESSTOKEN_EXPIRY } from '../core-constants/common.constants';
import { Config } from '../../interface';

class SessionManager {
  private static instance: SessionManager;
  private readonly ExpirationTime = (process.env.APP_ENV || '').toLowerCase() === 'prod' ? ACCESSTOKEN_EXPIRY.prod : ACCESSTOKEN_EXPIRY.dev; // Expiration to 900 seconds (15 minutes)
  private config: Config;
  private redisService: RedisService;

  constructor() {
    this.config = config;
    this.redisService = new RedisService(config);
  }

  public static getInstance(): SessionManager {
    if (!this.instance) {
      this.instance = new SessionManager();
    }
    return this.instance;
  }

  public async set(userId: string, sessionId: string): Promise<void> {
    try {
      const key = `${this.config.appEnv}-user-sessions-${userId}`;

      await this.redisService.addToSet(key, sessionId, this.ExpirationTime); // Add session ID to a Redis set
    } catch (err) {
      console.error('Redis connection failed:', err);
      throw err;
    }
  }

  public async get(userId: string): Promise<string[] | null> {
    try {
      const key = `${this.config.appEnv}-user-sessions-${userId}`;

      return await this.redisService.getSetMembers(key); // Get all session IDs from the Redis set
    } catch (err) {
      console.error('Redis connection failed:', err);
      throw err;
    }
  }

  public async delete(userId: string, sessionId: string): Promise<void> {
    try {
      const key = `${this.config.appEnv}-user-sessions-${userId}`;

      await this.redisService.removeFromSet(key, sessionId); // Remove specific session ID from the Redis set
    } catch (err) {
      console.error('Redis connection failed:', err);
      throw err;
    }
  }
}

export default SessionManager;