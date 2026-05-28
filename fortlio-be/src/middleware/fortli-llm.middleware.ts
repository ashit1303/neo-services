import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../core/core-clients/redis-service.client';
import { Config } from '../interface/common.interface';

export class FortiLLMMiddleware {
  private redisService: RedisService;
  private config: Config;

  // private LIMIT = 20;
  // private WINDOW_MS = 60 * 1000;

  constructor(config: Config) {
    this.redisService = new RedisService(config);
    this.config = config;
  }

  //   rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //     const sessionId = req.cookies?.sessionId;

  //     if (!sessionId) {
  //       res.status(400).json({ error: 'Missing session' });
  //       return;
  //     }

  //     const key = `rl:${this.config.appEnv}:${sessionId}`;
  //     const now = Date.now();
  //     const windowStart = now - this.WINDOW_MS;

  //     try {
  //       // remove old requests
  //       await this.redisService.zremrangebyscore(key, 0, windowStart);

  //       // count current requests
  //       const count = await this.redisService.zcard(key);

  //       if (count >= this.LIMIT) {
  //         res.status(429).json({
  //           error: 'Too many requests. Please slow down.',
  //         });
  //         return;
  //       }

  //       // add new request
  //       await this.redisService.zadd(key, now, `${now}-${Math.random()}`);

  //       // expire key
  //       await this.redisService.expire(key, 120);

  //       next();
  //     } catch (err) {
  //       console.error('Rate limiter error:', err);
  //       next(); // fail open
  //     }
  //   };

  //   memoryMiddleware = (llmClient: any) => async (
  //     req: Request,
  //     res: Response,
  //     next: NextFunction,
  //   ): Promise<void> => {
  //     const sessionId = req.cookies?.sessionId;

  //     if (!sessionId) {
  //       res.status(400).json({ error: 'Missing session' });
  //       return;
  //     }

  //     const baseKey = `session:${this.config.appEnv}:${sessionId}`;

  //     const MESSAGES_KEY = `${baseKey}:messages`;
  //     const SUMMARY_KEY = `${baseKey}:summary`;
  //     const COUNT_KEY = `${baseKey}:count`;

  //     let messages = JSON.parse((await this.redisService.get(MESSAGES_KEY)) || '[]');
  //     let summary = (await this.redisService.get(SUMMARY_KEY)) || '';
  //     let count = parseInt((await this.redisService.get(COUNT_KEY)) || '0');

  //     // attach to request
  //     (req as any).llmContext = {
  //       messages,
  //       summary,
  //     };

  //     const originalJson = res.json.bind(res);

  //     res.json = async (body: any): Promise<Response> => {
  //       try {
  //         const userMessage = req.body?.message;
  //         const assistantMessage = body?.reply;
  //         messages.push({ role: 'user', content: userMessage });
  //         messages.push({ role: 'assistant', content: assistantMessage });

  //         // keep last 6 exchanges (12 entries)
  //         if (messages.length > 12) {
  //           messages = messages.slice(-12);
  //         }

  //         count += 1;
  //         const SHOULD_SUMMARIZE = count % 4 === 0;

  //         if (SHOULD_SUMMARIZE) {
  //           const textToSummarize = messages
  //             .map((m: any) => `${m.role}: ${m.content}`)
  //             .join('\n');

  //           const summaryPrompt = `
  // Summarize this conversation in short bullet points.
  // Focus on:
  // - user intent
  // - decisions
  // - important facts

  // Conversation:
  // ${summary}

  // ${textToSummarize}
  // `;

  //           const summaryResult = await llmClient.sendSummary(summaryPrompt);

  //           summary = summaryResult;

  //           // keep only last 2 exchanges
  //           messages = messages.slice(-4);
  //         }
  //         await this.redisService.set(MESSAGES_KEY, JSON.stringify(messages));
  //         await this.redisService.set(SUMMARY_KEY, summary);
  //         await this.redisService.set(COUNT_KEY, count.toString());
  //       } catch (err) {
  //         console.error('Memory middleware error:', err);
  //       }

  //       return originalJson(body);
  //     };

  //     next();
  //   };

  validateSession = async (req: Request, res: Response, next: NextFunction,
  ): Promise<void> => {
    try {
      const sessionId = req.cookies?.sessionId;

      if (!sessionId) {
        res.status(401).json({ error: 'No session' });
        return;
      }

      const key = `session:${this.config.appEnv}:${sessionId}`;
      const session = await this.redisService.get(key);

      if (!session) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }

      // attach to request
      (req as any).session = JSON.parse(session);
      (req as any).sessionId = sessionId;

      next();
    } catch (err) {
      console.error('Session middleware error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
