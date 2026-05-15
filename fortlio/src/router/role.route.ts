import { Router } from 'express';
import { checkAccess } from '../middleware/auth.middleware';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';
import { RoleController } from '../controller/role.controller';

class RoleRoutes {
  roleController: RoleController;
  router: Router = Router();
  cacheMiddleware: CachingMiddleware;

  constructor() {
    this.roleController = new RoleController();
    this.cacheMiddleware = new CachingMiddleware(config);
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // GET all roles
    this.router.get(
      '/getRoles',
      checkAccess('getRoles'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getRoles.bind(this.roleController),
    );

    // GET roles with privileges
    this.router.get(
      '/getRolesWithPrivileges',
      checkAccess('getRolesWithPrivileges'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getRolesWithPrivileges.bind(this.roleController),
    );

    // GET privileges
    this.router.get(
      '/getPrivileges',
      checkAccess('getPrivileges'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getPrivileges.bind(this.roleController),
    );

    // GET role by ID
    this.router.get(
      '/getRoleById',
      checkAccess('getRoleById'),
      (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 3600),
      this.roleController.getRoleById.bind(this.roleController),
    );

    // CREATE role
    this.router.post(
      '/createRole',
      checkAccess('createRole'),
      this.roleController.createRole.bind(this.roleController),
    );

    // UPDATE role
    this.router.put(
      '/updateRole',
      checkAccess('updateRole'),
      this.roleController.updateRole.bind(this.roleController),
    );

    // DELETE role
    this.router.delete(
      '/deleteRole',
      checkAccess('deleteRole'),
      this.roleController.deleteRole.bind(this.roleController),
    );
  }
}

export const roleRoutes = new RoleRoutes().router;