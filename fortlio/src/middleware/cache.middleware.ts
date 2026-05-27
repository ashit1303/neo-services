import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../core/core-clients/redis-service.client';
import { Config } from '../interface/common.interface';

export class CachingMiddleware {
  private redisService: RedisService;
  private config: Config;
  constructor(config: Config) {
    this.redisService = new RedisService(config);
    this.config = config;
  }

  cacheReqRes = async (req: Request, res: Response, next: NextFunction, ttl = 180): Promise<void> => {
    const key = `CACHE:${this.config.appEnv}${req.originalUrl}`;
    const cached = await this.redisService.get(key);

    if (cached) {
      res.json(JSON.parse(cached)); // respond and exit
      return;
    }

    const originalJson = res.json.bind(res);

    res.json = (body: any): Response => {
      if (res.statusCode === 200 && this.config.appEnv !== 'LOCAL') {
        this.redisService.set(key, JSON.stringify(body), ttl).catch(console.error);
      }
      return originalJson(body);
    };

    next();
  };
};