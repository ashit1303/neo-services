import { Router } from 'express';
import type { HrController } from '../controller/hr.controller';
import type { AuthGuard } from '../middleware/auth.middleware';
import type { ChecksumVerifyMiddleware } from '../middleware/checksum-middleware';

export class HrRoutes {
  public router: Router = Router();

  constructor(
    private hrController: HrController,
    private authGuard: AuthGuard,
    private checksumVerifyMiddleware: ChecksumVerifyMiddleware,
  ) {
    this.initializeHrRoutes();
  }

  private initializeHrRoutes(): void {
    this.router.post('/profile', this.authGuard.checkAccess('upsertHrProfile'), this.hrController.upsertProfile);
    this.router.get('/profile/:userId', this.authGuard.checkAccess('getHrProfile'), this.hrController.getProfile);
    this.router.get('/history/viewed-profiles', this.authGuard.checkAccess('getViewedProfiles'), this.hrController.getViewedProfiles);
    this.router.get('/history/searches', this.authGuard.checkAccess('getSearches'), this.hrController.getSearches);
    this.router.get('/search', this.authGuard.checkAccess('searchCandidates'), this.checksumVerifyMiddleware.verifyGeneralChecksum, this.hrController.searchCandidates);
  }
}
