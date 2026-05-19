import { Router } from 'express';
import LeetcodeController from '../controller/leetcode.controller';
import { checkAccess } from '../middleware/auth.middleware';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';

class LeetcodeRoutes {
  leetcodeController: LeetcodeController;
  router: Router = Router();
  cacheMiddleware: CachingMiddleware;

  constructor() {
    this.leetcodeController = new LeetcodeController();
    this.cacheMiddleware = new CachingMiddleware(config);

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

    this.router.get(
      '/advanceSearch',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.leetcodeController.searchLeetCodeQuestsTypesense.bind(this.leetcodeController),
    );
  }
}

export const leetcodeRoutes = new LeetcodeRoutes().router;
