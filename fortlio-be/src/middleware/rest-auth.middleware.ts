import { NextFunction, Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import type { MongoDBClient } from '../core/core-clients/mongodb.client';
import type { RedisService } from '../core/core-clients/redis-service.client';
import type { AuthnService } from '../services/authn.services';
import { AppError } from '../core/core-utils/err-util';
import { AUTHN_MSGS } from '../constants';

export class RestAuthMiddleware {

  constructor(private dbClient: MongoDBClient, private redisCache: RedisService, private authnService: AuthnService) { }

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
        throw new AppError(AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, { msg: AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, apiName: 'authn', debugValues: {} }, 401);
      }

      const userDetails = await this.authnService.verifyToken(accesstoken);

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
        throw new AppError(AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, { msg: AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, apiName: 'authz', debugValues: {} }, 401);
      }

    } catch (error: any) {
      throw error;
    }
  }

  async main(req: Request, _res: Response, next: NextFunction, apiName: string) {
    try {
      // fetch and store permissions in redis 

      await this.authn(req);
      await this.authz(req, apiName);

      next();
    } catch (error: any) {
      // console.error(`Error in RestAuthenticateAndAuthorizeMiddleware: ${error.message}`);
      throw next(error);
    }
  }
};

