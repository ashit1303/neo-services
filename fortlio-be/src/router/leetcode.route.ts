import { Router } from 'express';
import LeetcodeController from '../controller/leetcode.controller';
import type { CachingMiddleware } from '../middleware/cache.middleware';

export class LeetcodeRoutes {

  router: Router = Router();

  constructor(
    private leetcodeController: LeetcodeController,
    private cacheMiddleware: CachingMiddleware,
  ) {
    this.initializeLeetcodeRoutes();
  }

  private initializeLeetcodeRoutes() {

    this.router.get(
      '/explain',
      // checkAccess('explainLeetQuest'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.leetcodeController.explainLeetQuest.bind(this.leetcodeController),
    );

    this.router.get(
      '/search',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.leetcodeController.searchLeetCodeQuests.bind(this.leetcodeController),
    );

  }
}

