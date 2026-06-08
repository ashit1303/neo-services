import { Router } from 'express';
import type { CachingMiddleware } from '../middleware/cache.middleware';
import type { LeetcodeRoutes } from './leetcode.route';
import type { ShortnerRoutes } from './shortner.route';

export class ServicesRoutes {
  router: Router = Router();

  constructor(private cacheMiddleware: CachingMiddleware, private leetcodeRoutes: LeetcodeRoutes, private shortnerRoutes: ShortnerRoutes) {
    this.itializeDervicesRoutes();
  }

  private itializeDervicesRoutes() {
    this.router.use('/leetcode', (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60), this.leetcodeRoutes.router); // ROUTE CODE : 2100 
    this.router.use('/shorten', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), this.shortnerRoutes.router);
    this.router.use('/shortner', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), this.shortnerRoutes.router); // ROUTE CODE : 2200
  }
}

