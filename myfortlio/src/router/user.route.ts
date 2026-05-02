import { Router } from 'express';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { checkAccess } from '../middleware/auth.middleware';
import { config } from '../../config';
import UserController from '../controller/user.controller';

export class UserRoutes {
  userController: UserController;
  cacheMiddleware: CachingMiddleware;
  router: Router = Router();

  constructor() {
    this.userController = new UserController();
    this.cacheMiddleware = new CachingMiddleware(config);

    this.initializeUserRoutes();
  }

  private initializeUserRoutes() {
    this.router.get('/getUsers', checkAccess('getUsers'), (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60), this.userController.getUsers); // ROUTE CODE : 1100
    this.router.get('/getUserById', checkAccess('getUserById'), this.userController.getUserById); // ROUTE CODE : 1200

  }

}

