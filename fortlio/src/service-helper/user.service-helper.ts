import mongoose from 'mongoose';
import { getDataByFilter } from '../core/core-helper';
import User from '../models/user.model';
import { IFilter } from '../interface/common.interface';
import { IUserCreate, IUserUpdate } from '../interface/user-interface';
import { fmtErr } from '../core/core-utils/err-util';
import { USER_MSGS } from '../constants';

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
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USERS, apiName: 'getUsers', debugValues: { filterQuery } });
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
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER_BY_USER_ID, apiName: 'getUserByUserId', debugValues: { userId } });
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
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER_ALL_DETAILS, apiName: 'getUserAllDetails', debugValues: { userId } });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await User.findOne({ email }).populate('roleId');
    return user;
  }
  catch (error) {
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER_BY_EMAIL, apiName: 'getUserByEmail', debugValues: { email } });
  }
}

export async function createUser(userDetails: IUserCreate) {
  try {
    const user = new User(userDetails);

    await user.save();
    return user;
  } catch (error) {
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_CREATE_USER, apiName: 'createUser', debugValues: { userDetails } });
  }
}

export async function updateUser(userDetails: IUserUpdate) {
  try {
    return await User.findByIdAndUpdate(userDetails.userId, { ...userDetails }, { new: true }).populate('roleId');
  } catch (error) {
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_UPDATE_USER, apiName: 'updateUser', debugValues: { userDetails } });
  }
}

export async function updateUserByUserId(userId: string, status: boolean) {
  try {
    return await User.findByIdAndUpdate(userId, { status }, { new: true }).populate('roleId');
  } catch (error) {
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_UPDATE_USER, apiName: 'updateUserByUserId', debugValues: { userId, status } });
  }
}

export async function deleteUserById(userId: string) {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (error) {
    throw fmtErr(error, { msg: USER_MSGS.ERR.FAILED_TO_DELETE_USER, apiName: 'deleteUserById', debugValues: { userId } });
  }
}
