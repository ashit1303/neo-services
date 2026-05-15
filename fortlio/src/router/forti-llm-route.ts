import { Router } from 'express';
import { CachingMiddleware } from '../middleware/cache.middleware';
// import { FortiLLMMiddleware } from '../middleware/obi-llm.middleware';
import FortiLLMController from '../controller/forti-llm.controller';
import { config } from '../../config';

class FortiLLMRoutes {
  FortiLLMController: FortiLLMController;
  router: Router = Router();
  cacheMiddleware: CachingMiddleware;
  // obiLLMMiddleware: FortiLLMMiddleware;

  constructor() {
    this.FortiLLMController = new FortiLLMController();
    this.initializeFortiLLMRoutes();
    this.cacheMiddleware = new CachingMiddleware(config);
    // this.obiLLMMiddleware = new FortiLLMMiddleware(config);
  }

  private initializeFortiLLMRoutes() {
    this.router.get('/obi',
      // (req, res, next) => this.obiLLMMiddleware.validateSession(req,res,next),
      // (req, res, next) => this.obiLLMMiddleware.rateLimiter(req, res, next),
      // (req, res, next) => this.obiLLMMiddleware.memoryMiddleware(req, res, next),
      this.FortiLLMController.getAnswerFromQuestion.bind(this.FortiLLMController));

    this.router.get('/session',

      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60 * 2),
      this.FortiLLMController.getSession.bind(this.FortiLLMController));
  }
}

export const fortiLLMRoutes = new FortiLLMRoutes().router;
