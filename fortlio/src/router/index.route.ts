import { Router } from 'express';
import { userRoutes } from './user.route';
import { servicesRoutes } from './services.route';
import { authnRoutes } from './authn.route';
import { fortiLLMRoutes } from './forti-llm-route';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';
import { roleRoutes } from './role.route';

class Routes {
  cacheMiddleware: CachingMiddleware;
  router: Router = Router();

  constructor() {
    this.cacheMiddleware = new CachingMiddleware(config);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/auth', authnRoutes);
    this.router.use('/user', userRoutes);
    this.router.use('/role', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), roleRoutes);
    this.router.use('/services', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), servicesRoutes);
    this.router.use('/ask', fortiLLMRoutes);
  }
}

export default new Routes().router;
