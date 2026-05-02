import { DB_CONSTANTS } from '../constants/db-constants';
import { StatusCodes } from 'http-status-codes';
import { formatErrorMessage } from '../core/core-utils';
import { getDataByFilter } from '../core/core-helper';
import Privilege from '../models/privilege.model';
import Role from '../models/role.model';
import { redisClient } from '../clients';

export class RoleService {
  async createRole(name: string, description: string, rolePrivileges: [string], createdBy: string) {
    try {
      const newRole = new Role({ roleName: name, description, rolePrivileges, createdBy });
      await newRole.save();
      return newRole;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_CREATE_ROLE);
    }
  }

  async getRoles() {
    try {
      return await Role.find();
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_FETCH_ROLES);
    }
  }
  async getRolesWithPrivileges(filterQuery: any) {
    try {
      const basePipeline = [
        { $lookup: { from: 'privileges', localField: 'rolePrivileges', foreignField: 'code', as: 'rolePrivileges' } },
        { $addFields: { roleId: '$_id' } },
        { $addFields: { rolePrivileges: { $map: { input: '$rolePrivileges', as: 'p', in: { $mergeObjects: ['$$p', { privilegeId: '$$p._id' }] } } } } },
      ];
      return await getDataByFilter(filterQuery, basePipeline, ['tags', 'name'], Role);
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_FETCH_ROLES);
    }
  }

  async getPrivileges(filterQuery: any) {
    try {
      const basePipeline = [{ $addFields: { privilegeId: '$_id' } }];
      const result = await getDataByFilter(filterQuery, basePipeline, ['tags', 'name'], Privilege);
      return result;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_FETCH_ROLES);
    }
  }

  async getRoleById(id: string) {
    try {
      return await Role.findById(id);
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_FETCH_ROLE_BY_ID);
    }
  }

  async getRoleByName(name: string) {
    try {
      return await Role.findOne({ roleName: name });
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_FETCH_ROLE_BY_NAME);
    }
  }

  async updateRole(id: string, name: string, description: string, rolePrivileges: [string], modifiedBy: string) {
    try {
      // get role name and then delete permission by name from redis cache
      const roleDetails = await Role.findById(id);
      await redisClient.delete(`${roleDetails?.roleName}_permissions`);
      return await Role.findByIdAndUpdate(id, { rolePrivileges, roleName: name, description, modifiedBy }, { new: true });
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_UPDATE_ROLE);
    }
  }

  async deleteRoleById(id: string) {
    try {
      return await Role.findByIdAndDelete(id);
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.BAD_REQUEST, DB_CONSTANTS.FAILED_TO_DELETE_ROLE);
    }
  }
}