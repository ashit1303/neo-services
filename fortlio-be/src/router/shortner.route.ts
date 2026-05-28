import { Router } from 'express';
import { ShortnerController } from '../controller/shortner.controller';
import { AuthGuard } from '../middleware/auth.middleware';
import { CachingMiddleware } from '../middleware/cache.middleware';

export class ShortnerRoutes {
  router: Router = Router();

  constructor(
    private shortUrlController: ShortnerController,
    private cacheMiddleware: CachingMiddleware,
    private authGuard: AuthGuard,
  ) {
    this.initializeShortnerRoutes();
  }

  private initializeShortnerRoutes() {
    // new routes

    this.router.post(
      '/shortIt',
      this.authGuard.checkAccess('createShortUrl'),
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
      this.authGuard.checkAccess('isAvailable'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 0),
      this.shortUrlController.isAvailable.bind(this.shortUrlController),
    );
  }
}
