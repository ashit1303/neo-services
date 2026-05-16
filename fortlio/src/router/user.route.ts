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
    this.router.get('/getUsers', (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60), this.userController.getUsers);
    this.router.get('/getUserById', checkAccess('getUserById'), this.userController.getUserById);
    this.router.post('/createUser', checkAccess('createUser'), this.userController.createUser);
    this.router.put('/updateUserById', checkAccess('updateUserById'), this.userController.updateUserById);
    this.router.delete('/deleteUserById', checkAccess('deleteUserById'), this.userController.deleteUserById);

  }

}

export const userRoutes = new UserRoutes().router;