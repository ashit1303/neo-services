import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { FilterQueryValidation } from '../validations/common-validation';
import { UserCreateValidation, UserIdValidation, UserUpdateValidation } from '../validations/user-validation';
import { IRoleDoc, IUserCreate, IUserDoc, IUserUpdate } from '../interface/user-interface';
import { RoleService } from '../services/role.service';
import { fmtRes } from '../core/core-utils/res-util';
import { fmtErr, fmtPrntErr } from '../core/core-utils/err-util';
import { USER_MSGS } from '../constants';
import { IFilter } from '../interface/common.interface';

class UserController {
  userService: UserService;
  roleService: RoleService;

  constructor() {
    this.userService = new UserService();
    this.roleService = new RoleService();
  }

  getUsers = async (req: Request, res: Response) => {
    try {
      const { page, pageSize } = req.query as IFilter;
      FilterQueryValidation.parse({ page, pageSize });
      const users = await this.userService.getUsers({ page, pageSize });

      return fmtRes(res, users);
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USERS, apiName: 'getUsers' });
    }
  };
  getUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      UserIdValidation.parse(userId);

      const user = await this.userService.getUserByUserId(userId);

      if (!user) {
        return res.status(404).send({
          message: USER_MSGS.ERR.USER_NOT_FOUND,
        });
      }

      return fmtRes(res, user);
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER, apiName: 'getUserById' });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const input: IUserCreate = req.body;

      UserCreateValidation.parse(input);

      // email is mandatory + unique
      const existingEmail = await this.userService.getUserByEmail(input.email);

      if (existingEmail) {
        return res.status(409).send({
          message: USER_MSGS.ERR.EMAIL_ALREADY_EXISTS,
        });
      }

      const role = await this.roleService.getRoleById(input.roleId);

      if (!role) {
        return res.status(404).send({
          message: USER_MSGS.ERR.ROLE_NOT_FOUND,
        });
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
      throw fmtPrntErr(error, 400, { msg: USER_MSGS.ERR.FAILED_TO_CREATE_USER, apiName: 'createUser' });
    }
  };
  updateUserById = async (req: Request, res: Response) => {
    try {
      const input: IUserUpdate = req.body;

      UserUpdateValidation.parse(input);

      const user = await this.userService.getUserByUserId(input.userId);

      if (!user) {
        fmtErr(null, { msg: USER_MSGS.ERR.USER_NOT_FOUND, apiName: 'updateUserById' });
      }

      // email must be unique
      if (input.email) {
        const existingEmail = await this.userService.getUserByEmail(input.email);

        if (existingEmail) {
          fmtErr(null, { msg: USER_MSGS.ERR.EMAIL_ALREADY_EXISTS, apiName: 'updateUserById' });
        }
      }

      if (input.roleId) {
        const role = await this.roleService.getRoleById(input.roleId);

        if (!role) {
          fmtErr(null, { msg: USER_MSGS.ERR.ROLE_NOT_FOUND, apiName: 'updateUserById' });
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
      throw fmtPrntErr(error, 400, { msg: USER_MSGS.ERR.FAILED_TO_UPDATE_USER, apiName: 'updateUserById' });
    }
  };
  deleteUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      UserIdValidation.parse(userId);

      const user = await this.userService.getUserByUserId(userId);

      if (!user) {
        return res.status(404).send({
          message: USER_MSGS.ERR.USER_NOT_FOUND,
        });
      }

      await this.userService.deleteUserById(userId);

      const response = `User deleted successfully with user id: ${userId}`;

      console.info(response);

      return fmtRes(res, {
        message: response,
      });
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: USER_MSGS.ERR.FAILED_TO_DELETE_USER, apiName: 'deleteUserById' });
    }
  };
}
export default UserController;
