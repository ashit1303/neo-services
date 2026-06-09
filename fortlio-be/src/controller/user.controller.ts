import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { FilterQueryValidation } from '../validations/common-validation';
import { UserCreateValidation, UserIdValidation, UserUpdateValidation } from '../validations/user-validation';
import { IRoleDoc, IUserCreate, IUserDoc, IUserUpdate } from '../interface/user-interface';
import { RoleService } from '../services/role.service';
import { fmtRes } from '../core/core-utils/res-util';
import { AppError } from '../core/core-utils/err-util';
import { USER_MSGS } from '../constants';
import { IFilter } from '../interface/common.interface';

export class UserController {

  constructor(private userService: UserService,
    private roleService: RoleService) {
  }

  getUsers = async (req: Request, res: Response) => {
    try {
      const { page, pageSize } = req.query as IFilter;
      FilterQueryValidation.parse({ page, pageSize });
      const users = await this.userService.getUsers({ page, pageSize });

      return fmtRes(res, users);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USERS, apiName: 'getUsers', debugValues: { query: req.query }, error }, 400);
    }
  };
  getUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId: string };

      UserIdValidation.parse(userId);

      const user = await this.userService.getUserByUserId(userId);

      if (!user) {
        throw new AppError(USER_MSGS.ERR.USER_NOT_FOUND, { msg: USER_MSGS.ERR.USER_NOT_FOUND, apiName: 'getUserById', debugValues: { userId } });
      }

      return fmtRes(res, user);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER, apiName: 'getUserById', error }, 400);
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const input: IUserCreate = req.body;

      UserCreateValidation.parse(input);

      // email is mandatory + unique
      const existingEmail = await this.userService.getUserByEmail(input.email);

      if (existingEmail) {
        throw new AppError(USER_MSGS.ERR.EMAIL_ALREADY_EXISTS, { msg: USER_MSGS.ERR.EMAIL_ALREADY_EXISTS, apiName: 'createUser', debugValues: { email: input.email } });
      }

      const role = await this.roleService.getRoleById(input.roleId);

      if (!role) {
        throw new AppError(USER_MSGS.ERR.ROLE_NOT_FOUND, { msg: USER_MSGS.ERR.ROLE_NOT_FOUND, apiName: 'createUser', debugValues: { roleId: input.roleId } });
      }

      const user = await this.userService.createUser(input);

      const { _id: userId, ...userDetails } = user.toObject();
      const { _id: roleId, ...roleDetails } = role.toObject();

      return res.status(201).send({
        userId,
        ...userDetails,
        role: {
          roleId,
          ...roleDetails,
        },
      });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_CREATE_USER, apiName: 'createUser', error }, 400);
    }
  };
  updateUserById = async (req: Request, res: Response) => {
    try {
      const input: IUserUpdate = req.body;

      UserUpdateValidation.parse(input);

      const user = await this.userService.getUserByUserId(input.userId);

      if (!user) {
        throw new AppError(USER_MSGS.ERR.USER_NOT_FOUND, { msg: USER_MSGS.ERR.USER_NOT_FOUND, apiName: 'updateUserById', debugValues: { userId: input.userId } });
      }

      // email must be unique
      if (input.email) {
        const existingEmail = await this.userService.getUserByEmail(input.email);

        if (existingEmail) {
          throw new AppError(USER_MSGS.ERR.EMAIL_ALREADY_EXISTS, { msg: USER_MSGS.ERR.EMAIL_ALREADY_EXISTS, apiName: 'updateUserById', debugValues: { email: input.email } });
        }
      }

      if (input.roleId) {
        const role = await this.roleService.getRoleById(input.roleId);

        if (!role) {
          throw new AppError(USER_MSGS.ERR.ROLE_NOT_FOUND, { msg: USER_MSGS.ERR.ROLE_NOT_FOUND, apiName: 'updateUserById', debugValues: { roleId: input.roleId } });
        }
      }

      const updatedUser = (await this.userService.updateUser(input)) as IUserDoc;

      const { _id: userId, roleId: updatedRole, ...userDetails } =
        updatedUser;

      const { _id: roleId, ...roleDetails } = updatedRole as IRoleDoc;

      return fmtRes(res, {
        userId,
        ...userDetails,
        role: {
          roleId,
          ...roleDetails,
        },
      });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_UPDATE_USER, apiName: 'updateUserById', error }, 400);
    }
  };
  deleteUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      UserIdValidation.parse(userId);

      const user = await this.userService.getUserByUserId(userId);

      if (!user) {
        throw new AppError(USER_MSGS.ERR.USER_NOT_FOUND, { msg: USER_MSGS.ERR.USER_NOT_FOUND, apiName: 'deleteUserById', debugValues: { userId } });
      }

      await this.userService.deleteUserById(userId);

      const response = `User deleted successfully with user id: ${userId}`;

      console.info(response);

      return fmtRes(res, { message: response });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_DELETE_USER, apiName: 'deleteUserById', error }, 400);
    }
  };
}
