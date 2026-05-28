import { Router } from 'express';
import { UserRoutes } from './user.route';
import { ServicesRoutes } from './services.route';
import { AuthnRoutes } from './authn.route';
import { FortiLLMRoutes } from './forti-llm-route';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';
import { RoleRoutes } from './role.route';
import { UserController } from '../controller/user.controller';
import { UserService } from '../services/user.service';
import { AuthnService } from '../services/authn.services';
import { RoleService } from '../services/role.service';
import { mongoDbClient, ollamaClient, redisClient, secretManager, sessionManager } from '../clients';
import { AuthnController } from '../controller/authn.controller';
import { FortiLLMController } from '../controller/forti-llm.controller';
import { FortiLLMService } from '../services/forti-llm.service';
import { AuthGuard } from '../middleware/auth.middleware';
import { RestAuthMiddleware } from '../middleware/rest-auth.middleware';
import { RoleController } from '../controller/role.controller';
import { LeetcodeRoutes } from './leetcode.route';
import { ShortnerRoutes } from './shortner.route';
import { ShortnerController } from '../controller/shortner.controller';
import { ShortenerService } from '../services/shortener.service';
import LeetcodeController from '../controller/leetcode.controller';
import { LeetcodeService } from '../services/leetcode.service';

// ==========================================
// 2. SERVICES (BUSINESS LAYER)
// ==========================================
const userService = new UserService();
const authnService = new AuthnService(secretManager, sessionManager);
const roleService = new RoleService();
const fortiLLMService = new FortiLLMService();
const shortenerService = new ShortenerService();
const leetcodeService = new LeetcodeService(ollamaClient, secretManager);

// ==========================================
// 3. CONTROLLERS (ORCHESTRATION LAYER)
// ==========================================
const userController = new UserController(userService, roleService);
const authnController = new AuthnController(authnService, sessionManager);
const fortiLLMController = new FortiLLMController(fortiLLMService);
const roleController = new RoleController(roleService);
const shortnerController = new ShortnerController(shortenerService);
const leetcodeController = new LeetcodeController(leetcodeService);

// ==========================================
// 1. INFRASTRUCTURE & MIDDLEWARE
// ==========================================
const cacheMiddleware = new CachingMiddleware(config);
const restAuthMiddleware = new RestAuthMiddleware(mongoDbClient, redisClient, authnService);
const authGuard = new AuthGuard(restAuthMiddleware);

// ==========================================
// 4. SUB-ROUTERS (DELIVERY LAYER)
// ==========================================
const authnRoutes = new AuthnRoutes(authnController, cacheMiddleware, authGuard);
const userRoutes = new UserRoutes(userController, cacheMiddleware, authGuard);
const roleRoutes = new RoleRoutes(roleController, cacheMiddleware, authGuard);
const fortiLLMRoutes = new FortiLLMRoutes(fortiLLMController, cacheMiddleware);
const shortnerRoutes = new ShortnerRoutes(shortnerController, cacheMiddleware, authGuard);
const leetcodeRoutes = new LeetcodeRoutes(leetcodeController, cacheMiddleware);
const servicesRoutes = new ServicesRoutes(cacheMiddleware, leetcodeRoutes, shortnerRoutes);
// 
class AppRoutes {
  router: Router = Router();

  constructor(
    private cacheMiddleware: CachingMiddleware,
    private authnRoutes: AuthnRoutes,
    private userRoutes: UserRoutes,
    private roleRoutes: RoleRoutes,
    private servicesRoutes: ServicesRoutes,
    private fortiLLMRoutes: FortiLLMRoutes,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/auth', this.authnRoutes.router);
    this.router.use('/user', this.userRoutes.router);
    this.router.use('/role', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), this.roleRoutes.router);
    this.router.use('/services', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), this.servicesRoutes.router);
    this.router.use('/ask', this.fortiLLMRoutes.router);
  }
}

const appRoutes = new AppRoutes(
  cacheMiddleware,
  authnRoutes,
  userRoutes,
  roleRoutes,
  servicesRoutes,
  fortiLLMRoutes,
);

export default appRoutes;
