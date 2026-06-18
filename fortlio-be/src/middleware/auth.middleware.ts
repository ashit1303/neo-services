import type { NextFunction, Request, Response } from 'express';
import type { RestAuthMiddleware } from './rest-auth.middleware';

export class AuthGuard {
  constructor(private authMiddleware: RestAuthMiddleware) { }

  // Arrow function to preserve context
  public checkAccess = (actionName: string) => (req: Request, res: Response, next: NextFunction) => {
    this.authMiddleware.main(req, res, next, actionName);
  };

  public authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await this.authMiddleware.authn(req);
      next();
    } catch (error) {
      next(error);
    }
  };
}
