import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { USER_ERR_MSGS } from '../constants';
import { UserService } from '../services/user.service';
import { FilterQueryValidation } from '../validations/common-validation';
import { formatErrorMessage } from '../core/core-utils';
import { UserCreateValidation, UserIdValidation, UserUpdateValidation } from '../validations/user-validation';
import { IRoleDoc, IUserCreate, IUserDoc, IUserUpdate } from '../interface/user-interface';
import { RoleService } from '../services/role.service';

class UserController {
  userService: UserService;
  roleService: RoleService;

  constructor() {
    this.userService = new UserService();
    this.roleService = new RoleService();
  }

  async getUsers(req: Request, res: Response) {
    try {
      const { filterQuery } = req.query;

      FilterQueryValidation.parse(filterQuery);

      const users = await this.userService.getUsers(filterQuery as any);

      return res.status(200).send(users);
    } catch (error: any) {
      return res.status(500).send(
        formatErrorMessage(
          error,
          StatusCodes.INTERNAL_SERVER_ERROR,
          USER_ERR_MSGS.FAILED_TO_FETCH_ALL_USER,
        ),
      );
    }
  }
  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      UserIdValidation.parse(userId);

      const user = await this.userService.getUserByUserId(userId);

      if (!user) {
        return res.status(404).send({
          message: USER_ERR_MSGS.USER_NOT_FOUND,
        });
      }

      return res.status(200).send(user);
    } catch (error: any) {
      return res.status(500).send(
        formatErrorMessage(
          error,
          StatusCodes.INTERNAL_SERVER_ERROR,
          USER_ERR_MSGS.FAILED_TO_FETCH_USER,
        ),
      );
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const input: IUserCreate = req.body;

      UserCreateValidation.parse(input);

      // email is mandatory + unique
      const existingEmail = await this.userService.getUserByEmail(input.email);

      if (existingEmail) {
        return res.status(409).send({
          message: USER_ERR_MSGS.EMAIL_ALREADY_EXISTS,
        });
      }

      const role = await this.roleService.getRoleById(input.roleId);

      if (!role) {
        return res.status(404).send({
          message: USER_ERR_MSGS.ROLE_NOT_FOUND,
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
      return res.status(500).send(
        formatErrorMessage(
          error,
          StatusCodes.INTERNAL_SERVER_ERROR,
          USER_ERR_MSGS.FAILED_TO_CREATE_USER,
        ),
      );
    }
  }
  async updateUserById(req: Request, res: Response) {
    try {
      const input: IUserUpdate = req.body;

      UserUpdateValidation.parse(input);

      const user = await this.userService.getUserByUserId(input.userId);

      if (!user) {
        return res.status(404).send({
          message: USER_ERR_MSGS.USER_NOT_FOUND,
        });
      }

      // email must be unique
      if (input.email) {
        const existingEmail = await this.userService.getUserByEmail(input.email);

        if (existingEmail) {
          return res.status(409).send({
            message: USER_ERR_MSGS.EMAIL_ALREADY_EXISTS,
          });
        }
      }

      if (input.roleId) {
        const role = await this.roleService.getRoleById(input.roleId);

        if (!role) {
          return res.status(404).send({
            message: USER_ERR_MSGS.ROLE_NOT_FOUND,
          });
        }
      }

      const updatedUser = (await this.userService.updateUser(input)) as IUserDoc;

      const { _id: userId, roleId: updatedRole, ...userDetails } =
        updatedUser;

      const { _id: roleId, ...roleDetails } = updatedRole as IRoleDoc;

      return res.status(200).send({
        userId,
        ...userDetails,
        role: {
          roleId,
          ...roleDetails,
        },
      });
    } catch (error: any) {
      return res.status(500).send(
        formatErrorMessage(
          error,
          StatusCodes.INTERNAL_SERVER_ERROR,
          USER_ERR_MSGS.FAILED_TO_UPDATE_USER,
        ),
      );
    }
  }
  async deleteUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      UserIdValidation.parse(userId);

      const user = await this.userService.getUserByUserId(userId);

      if (!user) {
        return res.status(404).send({
          message: USER_ERR_MSGS.USER_NOT_FOUND,
        });
      }

      await this.userService.deleteUserById(userId);

      const response = `User deleted successfully with user id: ${userId}`;

      console.info(response);

      return res.status(200).send({
        message: response,
      });
    } catch (error: any) {
      return res.status(500).send(
        formatErrorMessage(
          error,
          StatusCodes.INTERNAL_SERVER_ERROR,
          USER_ERR_MSGS.FAILED_TO_DELETE_USER,
        ),
      );
    }
  }
}
export default UserController;
