import { Router } from 'express';
import { AuthnController } from '../controller/authn.controller';
import { AuthGuard } from '../middleware/auth.middleware';

export class AuthnRoutes {
  router: Router = Router();

  constructor(
    private authnController: AuthnController,
    private authGuard: AuthGuard,
  ) {
    this.initializeAuthnRoutes();
  }

  private initializeAuthnRoutes() {
    // new routes
    this.router.get('/sendOtp', this.authnController.sendOtp);
    this.router.get('/resendOtp', this.authnController.resendOtp);
    this.router.post('/verifyOtp', this.authnController.verifyOtp);
    this.router.get('/authenticate', this.authnController.authenticate);
    this.router.get('/refreshToken', this.authGuard.checkAccess('refreshToken'), this.authnController.refreshToken);
    this.router.get('/logout', this.authnController.logout);
  }
}

