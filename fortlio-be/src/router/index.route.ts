import { Router } from 'express';
import { UserRoutes } from './user.route';
import { ServicesRoutes } from './services.route';
import { AuthnRoutes } from './authn.route';
// import { FortiLLMRoutes } from './forti-llm-route';
import { CachingMiddleware } from '../middleware/cache.middleware';
import { config } from '../../config';
import { RoleRoutes } from './role.route';
import { UserController } from '../controller/user.controller';
import { UserService } from '../services/user.service';
import { AuthnService } from '../services/authn.services';
import { RoleService } from '../services/role.service';
import { mongoDbClient, llmClient, redisClient, secretManager, sesHelper } from '../clients';
import { AuthnController } from '../controller/authn.controller';
// import { FortiLLMController } from '../controller/forti-llm.controller';
// import { FortiLLMService } from '../services/forti-llm.service';
import { AuthGuard } from '../middleware/auth.middleware';
import { RestAuthMiddleware } from '../middleware/rest-auth.middleware';
import { RoleController } from '../controller/role.controller';
import { LeetcodeRoutes } from './leetcode.route';
import { ShortnerRoutes } from './shortner.route';
import { ShortnerController } from '../controller/shortner.controller';
import { ShortenerService } from '../services/shortener.service';
import LeetcodeController from '../controller/leetcode.controller';
import { LeetcodeService } from '../services/leetcode.service';
import { CandidateRoutes } from './candidate.route';
import { CandidateController } from '../controller/candidate.controller';
import { CandidateService } from '../services/candidate.service';
import { ChecksumVerifyMiddleware } from '../middleware/checksum-middleware';

import { HrService } from '../services/hr.service';
import { ConnectionService } from '../services/connection.service';
import { HistoryService } from '../services/history.service';

import { HrController } from '../controller/hr.controller';
import { ConnectionController } from '../controller/connection.controller';

import { HrRoutes } from './hr.route';
import { ConnectionRoutes } from './connection.route';

// ==========================================
// 2. SERVICES (BUSINESS LAYER)
// ==========================================
const userService = new UserService();
const authnService = new AuthnService(secretManager, sesHelper);
const roleService = new RoleService();
// const fortiLLMService = new FortiLLMService();
const shortenerService = new ShortenerService();
const leetcodeService = new LeetcodeService(llmClient, secretManager);
const candidateService = new CandidateService();
const hrService = new HrService();
const connectionService = new ConnectionService();
const historyService = new HistoryService();

// ==========================================
// 3. CONTROLLERS (ORCHESTRATION LAYER)
// ==========================================
const userController = new UserController(userService, roleService);
const authnController = new AuthnController(authnService);
// const fortiLLMController = new FortiLLMController(fortiLLMService);
const roleController = new RoleController(roleService);
const shortnerController = new ShortnerController(shortenerService);
const leetcodeController = new LeetcodeController(leetcodeService);
const candidateController = new CandidateController(candidateService, authnService, userService);
const hrController = new HrController(hrService, historyService, userService, authnService);
const connectionController = new ConnectionController(connectionService);

// ==========================================
// 1. INFRASTRUCTURE & MIDDLEWARE
// ==========================================
const cacheMiddleware = new CachingMiddleware(config);
const restAuthMiddleware = new RestAuthMiddleware(mongoDbClient, redisClient, authnService);
const authGuard = new AuthGuard(restAuthMiddleware);
const checksumVerifyMiddleware = new ChecksumVerifyMiddleware(config);

// ==========================================
// 4. SUB-ROUTERS (DELIVERY LAYER)
// ==========================================
const authnRoutes = new AuthnRoutes(authnController, authGuard);
const userRoutes = new UserRoutes(userController, cacheMiddleware, authGuard, checksumVerifyMiddleware);
const roleRoutes = new RoleRoutes(roleController, cacheMiddleware, authGuard);
// const fortiLLMRoutes = new FortiLLMRoutes(fortiLLMController, cacheMiddleware);
const shortnerRoutes = new ShortnerRoutes(shortnerController, cacheMiddleware, authGuard);
const leetcodeRoutes = new LeetcodeRoutes(leetcodeController, cacheMiddleware);
const servicesRoutes = new ServicesRoutes(cacheMiddleware, leetcodeRoutes, shortnerRoutes);
const candidateRoutes = new CandidateRoutes(candidateController, authGuard);
const hrRoutes = new HrRoutes(hrController, authGuard, checksumVerifyMiddleware);
const connectionRoutes = new ConnectionRoutes(connectionController, authGuard);
// 
class AppRoutes {
  router: Router = Router();

  constructor(
    private cacheMiddleware: CachingMiddleware,
    private authnRoutes: AuthnRoutes,
    private userRoutes: UserRoutes,
    private roleRoutes: RoleRoutes,
    private servicesRoutes: ServicesRoutes,
    private candidateRoutes: CandidateRoutes,
    private hrRoutes: HrRoutes,
    private connectionRoutes: ConnectionRoutes,
    // private fortiLLMRoutes: FortiLLMRoutes,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/auth', this.authnRoutes.router);
    this.router.use('/user', this.userRoutes.router);
    this.router.use('/role', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), this.roleRoutes.router);
    this.router.use('/services', this.cacheMiddleware.cacheReqRes.bind(this.cacheMiddleware), this.servicesRoutes.router);
    this.router.use('/candidate', this.candidateRoutes.router);
    this.router.use('/hr', this.hrRoutes.router);
    this.router.use('/connections', this.connectionRoutes.router);
    // this.router.use('/ask', this.fortiLLMRoutes.router);
  }
}

const appRoutes = new AppRoutes(
  cacheMiddleware,
  authnRoutes,
  userRoutes,
  roleRoutes,
  servicesRoutes,
  candidateRoutes,
  hrRoutes,
  connectionRoutes,
  // fortiLLMRoutes,
);

export default appRoutes;
