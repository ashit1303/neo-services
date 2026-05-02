import { StatusCodes } from 'http-status-codes';
import { FilterQueryValidation } from '../validations/common-validation';
import { formatErrorMessage } from '../core/core-utils';
import { RoleService } from '../services/role.service';
import { Request, Response } from 'express';
import { ROLE_ERR_MSGS } from '../constants';

export class RoleController {
  roleService: RoleService;
  constructor() {
    this.roleService = new RoleService();
  }

  async getRoles(req: Request, res: Response) {
    try {
      const fetchedRoles = await this.roleService.getRoles();

      const roles = fetchedRoles.map((role) => {
        const { _id: roleId, ...roleDetails } = role.toObject();
        return { roleId, ...roleDetails };
      });

      return res.status(200).send(roles);
    } catch (error: any) {
      return res.status(204).send(
        formatErrorMessage(error, StatusCodes.NO_CONTENT, ROLE_ERR_MSGS.FAILED_TO_FETCH_ALL_ROLES),
      );
    }
  }

  async getRolesWithPrivileges(req: Request, res: Response) {
    try {
      const filterQuery = req.query;

      FilterQueryValidation.parse(filterQuery);

      (filterQuery as any).page = 1;
      (filterQuery as any).limit = 1000;

      const roles = await this.roleService.getRolesWithPrivileges(filterQuery);

      return res.status(200).send(roles);
    } catch (error: any) {
      return res.status(204).send(
        formatErrorMessage(error, StatusCodes.NO_CONTENT, ROLE_ERR_MSGS.FAILED_TO_FETCH_ALL_ROLES),
      );
    }
  }
  async getPrivileges(req: Request, res: Response) {
    try {
      const filterQuery = req.query;

      FilterQueryValidation.parse(filterQuery);

      (filterQuery as any).page = 1;
      (filterQuery as any).limit = 1000;

      const privileges = await this.roleService.getPrivileges(filterQuery);

      return res.status(200).send(privileges);
    } catch (error: any) {
      return res.status(204).send(
        formatErrorMessage(error, StatusCodes.NO_CONTENT, ROLE_ERR_MSGS.FAILED_TO_FETCH_ALL_PRIVILEGES),
      );
    }
  }
  async getRoleById(req: Request, res: Response) {
    try {
      const { roleId } = req.params;

      RoleIdValidation.parse(roleId);

      const role = await this.roleService.getRoleById(roleId);

      if (!role) {
        return res.status(404).send({
          message: ROLE_ERR_MSGS.ROLE_NOT_FOUND,
        });
      }

      return res.status(200).send({
        roleId,
        ...role.toObject(),
      });
    } catch (error: any) {
      return res.status(204).send(
        formatErrorMessage(error, StatusCodes.NO_CONTENT, ROLE_ERR_MSGS.FAILED_TO_FETCH_ROLE),
      );
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const input: IRole = req.body;
      const userId = (req as any).user?.userId;

      RoleCreateValidation.parse(input);

      const role = await this.roleService.createRole(
        input.roleName,
        input.description,
        input.rolePrivileges,
        userId,
      );

      const { _id: roleId, ...roleDetails } = role.toObject();

      return res.status(201).send({
        roleId,
        ...roleDetails,
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        formatErrorMessage(error, StatusCodes.BAD_REQUEST, ROLE_ERR_MSGS.ERROR_CREATING_ROLE),
      );
    }
  }
  async updateRole(req: Request, res: Response) {
    try {
      const input: IRole = req.body;
      const userId = (req as any).user?.userId;

      RoleUpdateValidation.parse(input);

      const role = await this.roleService.updateRole(
        input.roleId,
        input.roleName,
        input.description,
        input.rolePrivileges,
        userId,
      );

      if (!role) {
        return res.status(404).send({
          message: ROLE_ERR_MSGS.ROLE_NOT_FOUND,
        });
      }

      const { _id: roleId, ...roleDetails } = role.toObject();

      return res.status(200).send({
        roleId,
        ...roleDetails,
      });
    } catch (error: any) {
      return res.status(400).send(
        formatErrorMessage(error, StatusCodes.BAD_REQUEST, ROLE_ERR_MSGS.FAILED_TO_UPDATE_ROLE),
      );
    }
  }
  async deleteRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params;

      RoleIdValidation.parse(roleId);

      const role = await this.roleService.deleteRoleById(roleId);

      if (!role) {
        return res.status(StatusCodes.NOT_FOUND).send({ message: ROLE_ERR_MSGS.ROLE_NOT_FOUND });
      }

      return res.status(200).send({
        roleId,
        ...role.toObject(),
      });
    } catch (error: any) {
      return res.status(400).send(
        formatErrorMessage(error, StatusCodes.BAD_REQUEST, ROLE_ERR_MSGS.FAILED_TO_DELETE_USER_ROLE),
      );
    }
  }

};
