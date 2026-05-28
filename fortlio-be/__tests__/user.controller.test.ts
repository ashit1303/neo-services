import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { AppError } from '../src/core/core-utils/err-util';
import { UserController } from '../src/controller/user.controller';
import { USER_MSGS } from '../src/constants';
import { Request, Response } from 'express';

// const { port } = config;
// const BASE_URL = `http://localhost:${port}/user/graphql`;
// const token = 'token';

// const secret = 'secret';

describe('UserController Unit Tests', () => {
  let userController: UserController;
  let mockUserService: any;
  let mockRoleService: any;
  let mockRes: any;

  const mockResponse = () => {
    const res: any = {};
    res.status = mock((code: number) => {
      res.statusCode = code;
      return res;
    });
    res.send = mock((body: any) => {
      res.body = body;
      return res;
    });
    res.json = mock((body: any) => {
      res.body = body;
      return res;
    });
    return res as unknown as Response;
  };

  const VALID_USER_ID = '123456789012345678901234';
  const VALID_ROLE_ID = '567890123456789012345678';
  const VALID_MOBILE = '919876543210';
  const VALID_EMAIL = 'test@example.com';
  const VALID_NAME = 'John Doe';

  beforeEach(() => {
    mockUserService = {
      getUsers: mock(() => Promise.resolve([])),
      getUserByUserId: mock(() => Promise.resolve(null)),
      getUserByEmail: mock(() => Promise.resolve(null)),
      createUser: mock(() => Promise.resolve({})),
      updateUser: mock(() => Promise.resolve({})),
      deleteUserById: mock(() => Promise.resolve({})),
    };

    mockRoleService = {
      getRoleById: mock(() => Promise.resolve(null)),
    };

    userController = new UserController(mockUserService, mockRoleService);
    mockRes = mockResponse();
  });

  describe('getUsers', () => {
    it('should successfully get users with valid parameters', async () => {
      const req = {
        query: { page: 1, pageSize: 10 },
      } as unknown as Request;

      const mockUsers = [{ _id: VALID_USER_ID, fullName: VALID_NAME }];
      mockUserService.getUsers.mockResolvedValue(mockUsers);

      await userController.getUsers(req, mockRes);

      expect(mockUserService.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body).toEqual({ success: true, data: mockUsers });
    });

    it('should throw AppError if validation fails', async () => {
      const req = {
        query: { page: 0 },
      } as unknown as Request;

      expect(userController.getUsers(req, mockRes)).rejects.toThrow(AppError);
    });

    it('should throw AppError if userService.getUsers throws', async () => {
      const req = {
        query: { page: 1, pageSize: 10 },
      } as unknown as Request;

      mockUserService.getUsers.mockRejectedValue(new Error('DB Error'));

      expect(userController.getUsers(req, mockRes)).rejects.toThrow(AppError);
    });
  });

  describe('getUserById', () => {
    it('should successfully get user by id', async () => {
      const req = {
        query: { userId: VALID_USER_ID },
      } as unknown as Request;

      const mockUser = { _id: VALID_USER_ID, fullName: VALID_NAME };
      mockUserService.getUserByUserId.mockResolvedValue(mockUser);

      await userController.getUserById(req, mockRes);

      expect(mockUserService.getUserByUserId).toHaveBeenCalledWith(VALID_USER_ID);
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body).toEqual({ success: true, data: mockUser });
    });

    it('should throw AppError if user ID is invalid length', async () => {
      const req = {
        query: { userId: 'short-id' },
      } as unknown as Request;

      expect(userController.getUserById(req, mockRes)).rejects.toThrow(AppError);
    });

    it('should throw AppError if user is not found', async () => {
      const req = {
        query: { userId: VALID_USER_ID },
      } as unknown as Request;

      mockUserService.getUserByUserId.mockResolvedValue(null);

      expect(userController.getUserById(req, mockRes)).rejects.toThrow(new AppError(USER_MSGS.ERR.USER_NOT_FOUND));
    });
  });

  describe('createUser', () => {
    it('should successfully create user', async () => {
      const input = {
        fullName: VALID_NAME,
        mobileNumber: VALID_MOBILE,
        email: VALID_EMAIL,
        roleId: VALID_ROLE_ID,
      };
      const req = {
        body: input,
      } as unknown as Request;

      const mockRoleObj = {
        _id: VALID_ROLE_ID,
        roleName: 'Admin',
        toObject: () => ({ _id: VALID_ROLE_ID, roleName: 'Admin' }),
      };

      const mockUserObj = {
        _id: VALID_USER_ID,
        fullName: VALID_NAME,
        toObject: () => ({ _id: VALID_USER_ID, fullName: VALID_NAME }),
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockRoleService.getRoleById.mockResolvedValue(mockRoleObj);
      mockUserService.createUser.mockResolvedValue(mockUserObj);

      await userController.createUser(req, mockRes);

      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(VALID_EMAIL);
      expect(mockRoleService.getRoleById).toHaveBeenCalledWith(VALID_ROLE_ID);
      expect(mockUserService.createUser).toHaveBeenCalledWith(input);
      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.body).toEqual({
        userId: VALID_USER_ID,
        fullName: VALID_NAME,
        role: {
          roleId: VALID_ROLE_ID,
          roleName: 'Admin',
        },
      });
    });

    it('should throw AppError if email already exists', async () => {
      const input = {
        fullName: VALID_NAME,
        mobileNumber: VALID_MOBILE,
        email: VALID_EMAIL,
        roleId: VALID_ROLE_ID,
      };
      const req = {
        body: input,
      } as unknown as Request;

      mockUserService.getUserByEmail.mockResolvedValue({ _id: VALID_USER_ID });

      expect(userController.createUser(req, mockRes)).rejects.toThrow(new AppError(USER_MSGS.ERR.EMAIL_ALREADY_EXISTS));
    });

    it('should throw AppError if role does not exist', async () => {
      const input = {
        fullName: VALID_NAME,
        mobileNumber: VALID_MOBILE,
        email: VALID_EMAIL,
        roleId: VALID_ROLE_ID,
      };
      const req = {
        body: input,
      } as unknown as Request;

      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockRoleService.getRoleById.mockResolvedValue(null);

      expect(userController.createUser(req, mockRes)).rejects.toThrow(new AppError(USER_MSGS.ERR.ROLE_NOT_FOUND));
    });
  });

  describe('updateUserById', () => {
    it('should successfully update user details', async () => {
      const input = {
        userId: VALID_USER_ID,
        fullName: 'Updated Name',
        email: 'newemail@example.com',
        roleId: VALID_ROLE_ID,
      };
      const req = {
        body: input,
      } as unknown as Request;

      const mockRoleObj = {
        _id: VALID_ROLE_ID,
        roleName: 'User',
      };

      const mockUpdatedUser = {
        _id: VALID_USER_ID,
        fullName: 'Updated Name',
        roleId: mockRoleObj,
      };

      mockUserService.getUserByUserId.mockResolvedValue({ _id: VALID_USER_ID });
      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockRoleService.getRoleById.mockResolvedValue(mockRoleObj);
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      await userController.updateUserById(req, mockRes);

      expect(mockUserService.getUserByUserId).toHaveBeenCalledWith(VALID_USER_ID);
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('newemail@example.com');
      expect(mockRoleService.getRoleById).toHaveBeenCalledWith(VALID_ROLE_ID);
      expect(mockUserService.updateUser).toHaveBeenCalledWith(input);
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body).toEqual({
        success: true,
        data: {
          userId: VALID_USER_ID,
          fullName: 'Updated Name',
          role: {
            roleId: VALID_ROLE_ID,
            roleName: 'User',
          },
        },
      });
    });

    it('should throw AppError if user does not exist to update', async () => {
      const input = {
        userId: VALID_USER_ID,
        fullName: 'Updated Name',
      };
      const req = {
        body: input,
      } as unknown as Request;

      mockUserService.getUserByUserId.mockResolvedValue(null);

      expect(userController.updateUserById(req, mockRes)).rejects.toThrow(new AppError(USER_MSGS.ERR.USER_NOT_FOUND));
    });
  });

  describe('deleteUserById', () => {
    it('should successfully delete user', async () => {
      const req = {
        params: { userId: VALID_USER_ID },
      } as unknown as Request;

      mockUserService.getUserByUserId.mockResolvedValue({ _id: VALID_USER_ID });
      mockUserService.deleteUserById.mockResolvedValue({});

      await userController.deleteUserById(req, mockRes);

      expect(mockUserService.getUserByUserId).toHaveBeenCalledWith(VALID_USER_ID);
      expect(mockUserService.deleteUserById).toHaveBeenCalledWith(VALID_USER_ID);
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body).toEqual({
        success: true,
        data: {
          message: `User deleted successfully with user id: ${VALID_USER_ID}`,
        },
      });
    });

    it('should throw AppError if user to delete is not found', async () => {
      const req = {
        params: { userId: VALID_USER_ID },
      } as unknown as Request;

      mockUserService.getUserByUserId.mockResolvedValue(null);

      expect(userController.deleteUserById(req, mockRes)).rejects.toThrow(new AppError(USER_MSGS.ERR.USER_NOT_FOUND));
    });
  });
});

