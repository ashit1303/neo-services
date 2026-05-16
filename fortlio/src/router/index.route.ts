import { Router } from 'express';
import { userRoutes } from './user.route';
import { servicesRoutes } from './services.route';
import { authnRoutes } from './authn.route';
import { fortiLLMRoutes } from './forti-llm-route';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';

class Routes {
  cacheMiddleware: CachingMiddleware;
  router: Router = Router();

  constructor() {
    this.cacheMiddleware = new CachingMiddleware(config);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/user', userRoutes); // ROUTE CODE : 1000
    this.router.use('/services', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), servicesRoutes); // ROUTE CODE : 2000
    this.router.use('/ask', fortiLLMRoutes); // ROUTE CODE : 3000
    this.router.use('/auth', authnRoutes); // ROUTE CODE : 4000
  }
}

export default new Routes().router;
