import { Router } from 'express';
import type { CachingMiddleware } from '../middleware/cache.middleware';
// import { FortiLLMMiddleware } from '../middleware/obi-llm.middleware';
import type { FortiLLMController } from '../controller/forti-llm.controller';

export class FortiLLMRoutes {
  router: Router = Router();

  constructor(private fortiLLMController: FortiLLMController, private cacheMiddleware: CachingMiddleware) {
    this.initializeFortiLLMRoutes();
    // this.obiLLMMiddleware = new FortiLLMMiddleware(config);
  }

  private initializeFortiLLMRoutes() {
    this.router.get('/obi',
      // (req, res, next) => this.obiLLMMiddleware.validateSession(req,res,next),
      // (req, res, next) => this.obiLLMMiddleware.rateLimiter(req, res, next),
      // (req, res, next) => this.obiLLMMiddleware.memoryMiddleware(req, res, next),
      this.fortiLLMController.getAnswerFromQuestion.bind(this.fortiLLMController));

    this.router.get('/session',

      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60 * 2),
      this.fortiLLMController.getSession.bind(this.fortiLLMController));
  }
}
