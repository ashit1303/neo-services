import { Router } from 'express';
import type { CachingMiddleware } from '../middleware/cache.middleware';
import type { UserController } from '../controller/user.controller';
import type { AuthGuard } from '../middleware/auth.middleware'; // If checkAccess is a pure helper, importing it is okay!

export class UserRoutes {
  // Publicly expose the router so the main app can mount it
  public router: Router = Router();

  // Inject dependencies via the constructor
  constructor(private userController: UserController, private cacheMiddleware: CachingMiddleware, private authGuard: AuthGuard) {
    this.initializeUserRoutes();
  }

  private initializeUserRoutes(): void {
    // 1. Fixed caching middleware layout using clean closures to avoid context mapping problems
    this.router.get(
      '/getUsers',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60),
      this.userController.getUsers,
    );

    this.router.get('/getUserById', this.authGuard.checkAccess('getUserById'), this.userController.getUserById);
    this.router.post('/createUser', this.userController.createUser);
    this.router.put('/updateUserById', this.authGuard.checkAccess('updateUserById'), this.userController.updateUserById);
    this.router.delete('/deleteUserById/:userId', this.authGuard.checkAccess('deleteUserById'), this.userController.deleteUserById);
  }
}
