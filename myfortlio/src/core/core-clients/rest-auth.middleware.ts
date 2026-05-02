
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { formatErrorMessage } from '../core-utils';
// import { AuthenticationHelper } from '../apis/authentication-helper';
import { Config } from '../../interface/common.interface';
// import { MongoDBClient, RedisService } from '../configuration';
import { PipelineStage } from 'mongoose';
import { RedisService } from './redis-service.client';
import { MongoDBClient } from './mongodb.client';
import { ERR_MSGS } from '../../constants/authn-err-msg.constants';

export class RestAuthMiddleware {

  private config: Config;
  private redisCache: RedisService;
  private dbClient;

  constructor(mongodbClient: MongoDBClient, config: Config) {
    this.config = config;
    this.redisCache = new RedisService(config);
    this.dbClient = mongodbClient;
  }

  static checkRoleAccess(allPrivileges: any, apiName: string): boolean {
    if (allPrivileges.includes(apiName)) {
      return true;
    }
    return false;
  }

  async authn(req: Request) {
    try {
      const accesstoken = req.headers.authorization as string;

      if (!accesstoken) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, ERR_MSGS.TOKEN_MISSING);
      }

      const userDetails = await new AuthenticationHelper(this.config).authenticate(accesstoken);

      req.headers.userId = userDetails.userId;
      req.headers.name = userDetails.name;
      req.headers.role = userDetails.role;
      return true;
    } catch (error: any) {
      throw error;
    }
  }

  async authz(req: Request, apiName: string) {
    try {
      // get from cache
      const rolesValues = await this.redisCache.get(req.headers.role + '_permissions');
      const userValues = await this.redisCache.get(req.headers.userId + '_permissions');

      let roleAccesses;
      let userAccesses;
      if (rolesValues) {
        roleAccesses = JSON.parse(rolesValues);
      }
      if (userValues) {
        userAccesses = JSON.parse(userValues);
      }
      // get from db  and store in cache 
      if (!roleAccesses?.length) {
        roleAccesses = await this.dbClient.connect().then(async (db) => {
          const pipeline: PipelineStage[] = [
            { $match: { roleName: req.headers.role } },
            { $project: { rolePrivileges: 1 } },
          ];
          const roleAccess = await db.collection('roles').aggregate(pipeline).toArray();
          await this.redisCache.set(req.headers.role + '_permissions', JSON.stringify(roleAccess[0].rolePrivileges), 300);
          return roleAccess[0].rolePrivileges;
        });
      }
      if (!userAccesses?.length) {
        userAccesses = await this.dbClient.connect().then(async (db) => {
          const pipeline: PipelineStage[] = [
            { $match: { userId: req.headers.userId } },
            { $project: { userPrivileges: 1 } },
          ];
          const userAccess = await db.collection('users').aggregate(pipeline).toArray();
          await this.redisCache.set(req.headers.userId + '_permissions', JSON.stringify(userAccess[0]?.userPrivileges || []), 300);
          return userAccess[0]?.userPrivileges || [];
        });
      }

      const allPrivileges = [...roleAccesses, ...userAccesses];
      if (!RestAuthMiddleware.checkRoleAccess(allPrivileges, apiName)) {
        throw formatErrorMessage(null, StatusCodes.FORBIDDEN, ERR_MSGS.UNAUTHORIZED_ACCESS);
      }

    } catch (error) {
      throw error;
    }
  }

  async main(req: Request, res: Response, next: NextFunction, apiName: string) {
    try {
      // fetch and store permissions in redis 

      await this.authn(req);
      await this.authz(req, apiName);

      next();
    } catch (error: any) {
      console.error(`Error in RestAuthenticateAndAuthorizeMiddleware: ${error.message}`);
      res
        .status(StatusCodes.UNAUTHORIZED)
        .send(formatErrorMessage(error, StatusCodes.UNAUTHORIZED, error?.extensions?.errorOrigin?.message || ERR_MSGS.FAILED_TO_AUTHENTICATE_USER));
    }
  }
};

