import { FilterQueryValidation } from '../validations/common-validation';
import { RoleService } from '../services/role.service';
import { Request, Response } from 'express';
import { fmtRes } from '../core/core-utils/res-util';
import { AppError } from '../core/core-utils/err-util';
import { RoleCreateValidation, RoleIdValidation, RoleUpdateValidation } from '../validations/role-validation';
import { IRole } from '../interface/user-interface';
import { ROLE_MSGS } from '../constants';

export class RoleController {
  roleService: RoleService;
  constructor() {
    this.roleService = new RoleService();
  }

  getRoles = async (_req: Request, res: Response) => {
    try {
      const fetchedRoles = await this.roleService.getRoles();
      const roles = fetchedRoles.map((role) => {
        const { _id: roleId, ...roleDetails } = role.toObject();
        return { roleId, ...roleDetails };
      });

      return fmtRes(res, roles);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ALL_ROLES, apiName: 'getRoles' }, 400);
      ;
    }
  };

  getRolesWithPrivileges = async (req: Request, res: Response) => {
    const filterQuery = req.query;

    try {
      FilterQueryValidation.parse(filterQuery);

      (filterQuery as any).page = 1;
      (filterQuery as any).limit = 1000;

      const roles = await this.roleService.getRolesWithPrivileges(filterQuery);

      return fmtRes(res, roles);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ALL_ROLES, apiName: 'getRolesWithPrivileges' }, 400);
    }
  };
  getPrivileges = async (req: Request, res: Response) => {
    try {
      const filterQuery = req.query;

      FilterQueryValidation.parse(filterQuery);

      (filterQuery as any).page = 1;
      (filterQuery as any).limit = 1000;

      const privileges = await this.roleService.getPrivileges(filterQuery);

      return fmtRes(res, privileges);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ALL_PRIVILEGES, apiName: 'getPrivileges' }, 400);
    }
  };
  getRoleById = async (req: Request, res: Response) => {
    const { roleId } = req.params;
    try {

      RoleIdValidation.parse(roleId);

      const role = await this.roleService.getRoleById(roleId);

      if (!role) {
        throw new AppError(ROLE_MSGS.ERR.ROLE_NOT_FOUND, { msg: ROLE_MSGS.ERR.ROLE_NOT_FOUND, apiName: 'getRoleById', debugValues: { roleId } });
      }

      return fmtRes(res, { roleId, ...role.toObject() });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLE, apiName: 'getRoleById' }, 400);
    }
  };

  createRole = async (req: Request, res: Response) => {
    const input: IRole = req.body;
    const userId = (req as any).user?.userId;
    try {
      RoleCreateValidation.parse(input);
      const role = await this.roleService.createRole(
        input.roleName,
        input.description,
        input.rolePrivileges,
        userId,
      );

      const { _id: roleId, ...roleDetails } = role.toObject();
      return res.status(201).send({ roleId, ...roleDetails });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_CREATE_ROLE, apiName: 'createRole', debugValues: { roleName: input.roleName } });
    }
  };
  updateRole = async (req: Request, res: Response) => {

    const input: IRole = req.body;
    const userId = (req as any).user?.userId;
    try {
      RoleUpdateValidation.parse(input);
      const role = await this.roleService.updateRole(
        input.roleId,
        input.roleName,
        input.description,
        input.rolePrivileges,
        userId,
      );
      if (!role) {
        throw new AppError(ROLE_MSGS.ERR.ROLE_NOT_FOUND, { msg: ROLE_MSGS.ERR.ROLE_NOT_FOUND, apiName: 'updateRole', debugValues: { roleId: input.roleId } });
      }

      const { _id: roleId, ...roleDetails } = role.toObject();

      return fmtRes(res, { roleId, ...roleDetails });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_UPDATE_ROLE, apiName: 'updateRole' }, 400);
    }
  };
  deleteRole = async (req: Request, res: Response) => {
    const { roleId } = req.params;
    try {
      RoleIdValidation.parse(roleId);
      const role = await this.roleService.deleteRoleById(roleId);
      if (!role) {
        throw new AppError(ROLE_MSGS.ERR.ROLE_NOT_FOUND, { msg: ROLE_MSGS.ERR.ROLE_NOT_FOUND, apiName: 'deleteRole', debugValues: { roleId } });
      }
      return fmtRes(res, { roleId, ...role.toObject() });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_DELETE_ROLE, apiName: 'deleteRole' }, 400);
    }
  };

};
