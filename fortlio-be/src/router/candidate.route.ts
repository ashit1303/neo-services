import { Router } from 'express';
import type { CandidateController } from '../controller/candidate.controller';
import type { AuthGuard } from '../middleware/auth.middleware';

export class CandidateRoutes {
  public router: Router = Router();

  constructor(
    private candidateController: CandidateController,
    private authGuard: AuthGuard,
  ) {
    this.initializeCandidateRoutes();
  }

  private initializeCandidateRoutes(): void {
    this.router.post('/profile', this.authGuard.checkAccess('upsertCandidateProfile'), this.candidateController.upsertProfile);
    this.router.get('/profile/:userId', this.authGuard.checkAccess('getCandidateProfile'), this.candidateController.getProfile);
    this.router.post('/blog', this.authGuard.checkAccess('createCandidateBlog'), this.candidateController.createBlog);
    this.router.get('/blogs', this.candidateController.listBlogs);
  }
}
