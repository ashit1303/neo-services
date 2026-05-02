import { Router } from 'express';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { leetcodeRoutes } from './leetcode.route';
import { shortnerRoutes } from './shortner.route';
import { config } from '../../config';

class ServicesRoutes {
  cacheMiddleware: CachingMiddleware;
  router: Router = Router();

  constructor() {
    this.cacheMiddleware = new CachingMiddleware(config);
    this.SnitializeDervicesRoutes();
  }

  private SnitializeDervicesRoutes() {
    this.router.use('/leetcode', (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60), leetcodeRoutes); // ROUTE CODE : 2100 
    this.router.use('/shortner', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), shortnerRoutes); // ROUTE CODE : 2200

  }
}

export const servicesRoutes = new ServicesRoutes().router;
