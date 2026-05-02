import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { USER_ERR_MSGS } from '../constants';
import { getDataByFilter } from '../core/core-helper';
import { formatErrorMessage } from '../core/core-utils';
import User from '../models/user.model';
import { IFilter } from '../interface/common.interface';
import { IUserCreate, IUserUpdate } from '../interface/user-interface';

export async function getUsers(filterQuery: IFilter) {
  try {
    const pipeline = [
      { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      { $addFields: { userId: '$_id', 'role.roleId': '$role._id' } },
    ];
    const searchFields = ['firstName', 'lastName', 'mobileNumber', 'email'];

    return await getDataByFilter(filterQuery, pipeline, searchFields, User);
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_FETCH_USERS);
  }
}

export async function getUserByUserId(userId: string) {
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
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_FETCH_USER_BY_ID);
  }
}

export async function getUserByMobileNumber(mobileNumber: string) {
  try {
    const pipeline = [
      { $match: { mobileNumber } },
      { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      { $addFields: { userId: '$_id', 'role.roleId': '$role._id' } },
    ];

    const result = await User.aggregate(pipeline).exec();

    if (!result.length) {
      return null;
    }

    return result[0];
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_FETCH_USER_BY_MOBILE);
  }
}

export async function getUserAllDetails(userId: string) {
  try {
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'roleDetails' } },
      { $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          userId: '$_id',
          'roleDetails.roleId': '$roleDetails._id',

        },
      },
    ];

    const result = await User.aggregate(pipeline).exec();

    if (!result?.length) {
      return null;
    }

    return result[0];
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_FETCH_USER_ALL_DETAILS);
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await User.findOne({ email }).populate('roleId');
    return user;
  }
  catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_FETCH_USER_BY_EMAIL);
  }
}

export async function createUser(userDetails: IUserCreate) {
  try {
    const user = new User(userDetails);

    await user.save();
    return user;
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_CREATE_USER);
  }
}

export async function updateUser(userDetails: IUserUpdate) {
  try {
    return await User.findByIdAndUpdate(userDetails.userId, { ...userDetails }, { new: true }).populate('roleId');
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_UPDATE_USER);
  }
}

export async function updateUserByUserId(userId: string, status: boolean) {
  try {
    return await User.findByIdAndUpdate(userId, { status }, { new: true }).populate('roleId');
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_UPDATE_USER);
  }
}

export async function deleteUserById(userId: string) {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, USER_ERR_MSGS.FAILED_TO_DELETE_USER);
  }
}
