import { StatusCodes } from 'http-status-codes';
import { getDataByFilter } from '../core/core-helper';
import User from '../models/user.model';
import mongoose from 'mongoose';
import { formatErrorMessage } from '../core/core-utils';
import { IUserCreate, IUserUpdate } from '../interface/user-interface';
import { IFilter } from '../interface/common.interface';

export class UserService {
  async getUsers(filterQuery: IFilter) {
    try {
      const pipeline = [
        { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
        { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
        { $addFields: { userId: '$_id', 'role.roleId': '$role._id' } },
      ];
      const searchFields = ['firstName', 'lastName', 'mobileNumber', 'email'];

      return await getDataByFilter(filterQuery, pipeline, searchFields, User);
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_FETCH_USERS);
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
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_FETCH_USER_BY_ID);
    }
  }
  async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email }).populate('roleId');
      return user;
    }
    catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_FETCH_USER_BY_EMAIL);
    }
  }
  async createUser(userDetails: IUserCreate) {
    try {
      const user = new User(userDetails);

      await user.save();
      return user;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_CREATE_USER);
    }
  }

  async updateUser(userDetails: IUserUpdate) {
    try {
      return await User.findByIdAndUpdate(userDetails.userId, { ...userDetails }, { new: true }).populate('roleId');
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_UPDATE_USER);
    }
  }

  async updateUserByUserId(userId: string, status: boolean) {
    try {
      return await User.findByIdAndUpdate(userId, { status }, { new: true }).populate('roleId');
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_UPDATE_USER);
    }
  }

  async deleteUserById(userId: string) {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, DB_CONSTANTS.FAILED_TO_DELETE_USER);
    }
  }
}
