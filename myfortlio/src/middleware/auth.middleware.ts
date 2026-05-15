import { NextFunction } from 'express';
import { RestAuthMiddleware } from '../middleware/rest-auth.middleware';
import { config } from '../../config';
import { mongoDbClient } from '../clients';

const authMiddleware = new RestAuthMiddleware(mongoDbClient, config);
export function checkAccess(actionName: string) {
  return (req: any, res: any, next: NextFunction) => {
    authMiddleware.main(req, res, next, actionName);
  };
}