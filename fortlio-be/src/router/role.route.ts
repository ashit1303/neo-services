import { Router } from 'express';
import type { AuthGuard } from '../middleware/auth.middleware';
import type { CachingMiddleware } from '../middleware/cache.middleware';
import type { RoleController } from '../controller/role.controller';

export class RoleRoutes {
  router: Router = Router();
  ;
  ;

  constructor(
    private roleController: RoleController,
    private cacheMiddleware: CachingMiddleware,
    private authGuard: AuthGuard,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // GET all roles
    this.router.get(
      '/getRoles',
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getRoles.bind(this.roleController),
    );

    // GET roles with privileges
    this.router.get(
      '/getRolesWithPrivileges',
      this.authGuard.checkAccess('getRolesWithPrivileges'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getRolesWithPrivileges.bind(this.roleController),
    );

    // GET privileges
    this.router.get(
      '/getPrivileges',
      this.authGuard.checkAccess('getPrivileges'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getPrivileges.bind(this.roleController),
    );

    // GET role by ID
    this.router.get(
      '/getRoleById',
      this.authGuard.checkAccess('getRoleById'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getRoleById.bind(this.roleController),
    );

    // CREATE role
    this.router.post(
      '/createRole',
      this.authGuard.checkAccess('createRole'),
      this.roleController.createRole.bind(this.roleController),
    );

    // UPDATE role
    this.router.put(
      '/updateRole',
      this.authGuard.checkAccess('updateRole'),
      this.roleController.updateRole.bind(this.roleController),
    );

    // DELETE role
    this.router.delete(
      '/deleteRole',
      this.authGuard.checkAccess('deleteRole'),
      this.roleController.deleteRole.bind(this.roleController),
    );
  }
}
