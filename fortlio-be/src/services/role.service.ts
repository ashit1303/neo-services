import { getDataByFilter } from '../core/core-helper';
import Privilege from '../models/privilege.model';
import Role from '../models/role.model';
import { redisClient } from '../clients';
import { AppError } from '../core/core-utils/err-util';
import { ROLE_MSGS } from '../constants';

export class RoleService {
  async createRole(name: string, description: string, rolePrivileges: [string], createdBy: string) {
    try {
      const newRole = new Role({ roleName: name, description, rolePrivileges, createdBy });
      await newRole.save();
      return newRole;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_CREATE_ROLE, apiName: 'createRole' });
    }
  }

  async getRoles() {
    try {
      return await Role.find();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLES, apiName: 'getRoles' });
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
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLES_WITH_PRIVILEGES, apiName: 'getRolesWithPrivileges' });
    }
  }

  async getPrivileges(filterQuery: any) {
    try {
      const basePipeline = [{ $addFields: { privilegeId: '$_id' } }];
      const result = await getDataByFilter(filterQuery, basePipeline, ['tags', 'name'], Privilege);
      return result;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_PRIVILEGES, apiName: 'getPrivileges' });
    }
  }

  async getRoleById(id: string) {
    try {
      return await Role.findById(id);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLE_BY_ID, apiName: 'getRoleById' });
    }
  }

  async getRoleByName(name: string) {
    try {
      return await Role.findOne({ roleName: name });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLE_BY_NAME, apiName: 'getRoleByName' });
    }
  }

  async updateRole(id: string, name: string, description: string, rolePrivileges: [string], modifiedBy: string) {
    try {
      // get role name and then delete permission by name from redis cache
      const roleDetails = await Role.findById(id);
      await redisClient.delete(`${roleDetails?.roleName}_permissions`);
      return await Role.findByIdAndUpdate(id, { rolePrivileges, roleName: name, description, modifiedBy }, { new: true });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_UPDATE_ROLE, apiName: 'updateRole' });
    }
  }

  async deleteRoleById(id: string) {
    try {
      return await Role.findByIdAndDelete(id);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: ROLE_MSGS.ERR.FAILED_TO_DELETE_ROLE_BY_ID, apiName: 'deleteRoleById' });
    }
  }
}