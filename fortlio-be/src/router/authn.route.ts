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
    this.router.post('/register', this.authnController.register);// >>email password <<
    this.router.post('/login', this.authnController.login);// email password

    this.router.get('/refreshToken', this.authGuard.checkAccess('refreshToken'), this.authnController.refreshToken); //refreshToken 

    this.router.get('/logout', this.authnController.logout);// refresh token 

    this.router.get('/verifyEmail', this.authnController.verifyEmail);
    this.router.post('/resendVerification', this.authnController.resendVerification);
  }
}

