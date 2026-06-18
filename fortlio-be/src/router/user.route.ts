import { Router } from 'express';
import type { CachingMiddleware } from '../middleware/cache.middleware';
import type { UserController } from '../controller/user.controller';
import type { AuthGuard } from '../middleware/auth.middleware';
import type { ChecksumVerifyMiddleware } from '../middleware/checksum-middleware';

export class UserRoutes {
  public router: Router = Router();

  constructor(
    private userController: UserController,
    private cacheMiddleware: CachingMiddleware,
    private authGuard: AuthGuard,
    private checksumVerifyMiddleware: ChecksumVerifyMiddleware,
  ) {
    this.initializeUserRoutes();
  }

  private initializeUserRoutes(): void {
    this.router.get(
      '/getUsers',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60),
      this.userController.getUsers,
    );

    this.router.get('/getUserById', this.authGuard.checkAccess('getUserById'), this.userController.getUserById);
    this.router.post('/createUser', this.userController.createUser);
    this.router.put('/updateUserById', this.authGuard.checkAccess('updateUserById'), this.userController.updateUserById);
    this.router.delete('/deleteUserById/:userId', this.authGuard.checkAccess('deleteUserById'), this.userController.deleteUserById);
    this.router.post('/watch-ad', this.checksumVerifyMiddleware.verifyGeneralChecksum, this.userController.watchAd);
  }
}
