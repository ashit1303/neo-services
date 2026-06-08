
import { getDataByFilter } from '../core/core-helper';
import User from '../models/user.model';
import mongoose from 'mongoose';
import { IUserCreate, IUserUpdate } from '../interface/user-interface';
import { IFilter } from '../interface/common.interface';
import { AppError } from '../core/core-utils/err-util';
import { USER_MSGS } from '../constants';

export class UserService {
  async getUsers(filterQuery: IFilter) {
    try {
      const pipeline = [
        { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
        { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
        { $addFields: { userId: '$_id', 'role.roleId': '$role._id' } },
      ];
      const searchFields = ['fullName', 'lastName', 'mobileNumber', 'email'];

      return await getDataByFilter(filterQuery, pipeline, searchFields, User);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USERS, apiName: 'getUsers' });
    }
  }
  async getUserByUserId(userId: string) {
    try {
      const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
        { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
        { $addFields: { userId: '$_id', 'role.roleId': '$role._id' } },
      ];

      const result = await User.aggregate(pipeline).exec();

      if (!result?.length) {
        return null;
      }

      return result[0];
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER_BY_USER_ID, apiName: 'getUserByUserId', debugValues: { userId } });
    }
  }
  async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email }).populate('roleId');
      return user;
    }
    catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER_BY_EMAIL, apiName: 'getUserByEmail', debugValues: { email } });
    }
  }
  async createUser(userDetails: IUserCreate) {
    try {
      const user = new User(userDetails);

      await user.save();
      return user;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_CREATE_USER, apiName: 'createUser', debugValues: { userDetails } });
    }
  }

  async updateUser(userDetails: IUserUpdate) {
    try {
      return await User.findByIdAndUpdate(userDetails.userId, { ...userDetails }, { new: true }).populate('roleId');
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_UPDATE_USER, apiName: 'updateUser', debugValues: { userDetails } });
    }
  }

  async updateUserByUserId(userId: string, status: boolean) {
    try {
      return await User.findByIdAndUpdate(userId, { status }, { new: true }).populate('roleId');
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_UPDATE_USER, apiName: 'updateUserByUserId', debugValues: { userId, status } });
    }
  }

  async deleteUserById(userId: string) {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: USER_MSGS.ERR.FAILED_TO_DELETE_USER, apiName: 'deleteUserById', debugValues: { userId } });
    }
  }

  async addCoins(userId: string, amount: number) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: Math.abs(amount) } },
        { new: true },
      ).exec();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Failed to add coins to user', apiName: 'addCoins', debugValues: { userId, amount } });
    }
  }

  async deductCoins(userId: string, amount: number) {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        throw new AppError(USER_MSGS.ERR.USER_NOT_FOUND, { msg: USER_MSGS.ERR.USER_NOT_FOUND, apiName: 'deductCoins' });
      }

      const currentCoins = user.coins || 0;
      if (currentCoins < amount) {
        throw new AppError('Insufficient coins', { msg: 'Insufficient coins', apiName: 'deductCoins', debugValues: { userId, currentCoins, amount } }, 402);
      }

      return await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: -(Math.abs(amount)) } },
        { new: true },
      ).exec();
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: 'Failed to deduct coins from user', apiName: 'deductCoins', debugValues: { userId, amount } });
    }
  }
}
