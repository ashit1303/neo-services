import { Router } from 'express';
import ShortnerController from '../controller/shortner.controller';
import { checkAccess } from '../middleware/auth.middleware';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';

class ShortnerRoutes {
  shortUrlController: ShortnerController;
  router: Router = Router();
  cacheMiddleware: CachingMiddleware;

  constructor() {
    this.shortUrlController = new ShortnerController();
    this.cacheMiddleware = new CachingMiddleware(config);

    this.initializeShortnerRoutes();
  }

  private initializeShortnerRoutes() {
    // new routes

    this.router.post(
      '/shortIt',
      checkAccess('createShortUrl'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 0),
      this.shortUrlController.createShortUrl.bind(this.shortUrlController),
    );

    this.router.post(
      '/shortItByGuest',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 0),
      this.shortUrlController.createShortUrlByGuest.bind(this.shortUrlController),
    );

    this.router.get(
      '/s/:shortValue',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 0),
      this.shortUrlController.redirectToUrl.bind(this.shortUrlController),
    );

    this.router.get(
      '/is-available',
      checkAccess('isAvailable'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 0),
      this.shortUrlController.isAvailable.bind(this.shortUrlController),
    );
  }
}

export const shortnerRoutes = new ShortnerRoutes().router;
