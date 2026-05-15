import { Router } from 'express';
import AuthnController from '../controller/authn.controller';
import { CachingMiddleware } from '../middleware/cache.middleware';
// import { checkAccess } from '../middleware/auth.middleware';
import { config } from '../../config';

class AuthnRoutes {
  authnController: AuthnController;
  cacheMiddleware: CachingMiddleware;
  router: Router = Router();

  constructor() {
    this.authnController = new AuthnController();
    this.cacheMiddleware = new CachingMiddleware(config);
    this.initializeAuthnRoutes();
  }

  private initializeAuthnRoutes() {
    // new routes
    this.router.get(
      '/sendOtp',
      this.authnController.sendOtp.bind(this.authnController),
    );
    this.router.get(
      '/resendOtp',
      this.authnController.resendOtp.bind(this.authnController),
    );
    this.router.get(
      '/verifyOtp',
      this.authnController.verifyOtp.bind(this.authnController),
    );
    this.router.get(
      '/authenticate',
      this.authnController.authenticate.bind(this.authnController),
    );
    this.router.get(
      '/refreshToken',
      this.authnController.refreshToken.bind(this.authnController),
    );
    this.router.get(
      '/logout',
      this.authnController.logout.bind(this.authnController),
    );
    // this.router.get('/example',
    //   // checkAccess('example'),
    //   // (req, res, next) => this.cacheMiddleware.cacheReqRes(req, res, next, 60 * 60),
    //   this.authnController.example.bind(this.authnController),
    // );
  }
}

export const authnRoutes = new AuthnRoutes().router;

