import Privilege from '../models/privilege.model';
import { getDataByFilter } from '../core/core-helper/mongo.helper';
import Role from '../models/role.model';
import { fmtErr } from '../core/core-utils/err-util';
import { ROLE_MSGS } from '../constants';
import { redisClient } from '../clients';

export async function createRole(name: string, description: string, rolePrivileges: [string], createdBy: string) {
  try {
    const newRole = new Role({ roleName: name, description, rolePrivileges, createdBy });
    await newRole.save();
    return newRole;
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_CREATE_ROLE, apiName: 'createRole', debugValues: { name, description, rolePrivileges, createdBy } });
  }
}

export async function getRoles() {
  try {
    return await Role.find();
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLES, apiName: 'getRoles' });
  }
}
export async function getRolesWithPrivileges(filterQuery: any) {
  try {
    const basePipeline = [
      { $lookup: { from: 'privileges', localField: 'rolePrivileges', foreignField: 'code', as: 'rolePrivileges' } },
      { $addFields: { roleId: '$_id' } },
      { $addFields: { rolePrivileges: { $map: { input: '$rolePrivileges', as: 'p', in: { $mergeObjects: ['$$p', { privilegeId: '$$p._id' }] } } } } },
    ];
    return await getDataByFilter(filterQuery, basePipeline, ['tags', 'name'], Role);
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLES, apiName: 'getRolesWithPrivileges' });
  }
}

export async function getPrivileges(filterQuery: any) {
  try {
    const basePipeline = [{ $addFields: { privilegeId: '$_id' } }];
    const result = await getDataByFilter(filterQuery, basePipeline, ['tags', 'name'], Privilege);
    return result;
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_PRIVILEGES, apiName: 'getPrivileges' });
  }
}

export async function getRoleById(id: string) {
  try {
    return await Role.findById(id);
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLE, apiName: 'getRoleById', debugValues: { id } });
  }
}

export async function getRoleByName(name: string) {
  try {
    return await Role.findOne({ roleName: name });
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_FETCH_ROLE, apiName: 'getRoleByName', debugValues: { name } });
  }
}

export async function updateRole(id: string, name: string, description: string, rolePrivileges: [string], modifiedBy: string) {
  try {
    // get role name and then delete permission by name from redis cache
    const roleDetails = await Role.findById(id);
    await redisClient.delete(`${roleDetails?.roleName}_permissions`);
    return await Role.findByIdAndUpdate(id, { rolePrivileges, roleName: name, description, modifiedBy }, { new: true });
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_UPDATE_ROLE, apiName: 'updateRole', debugValues: { id, name, description, rolePrivileges, modifiedBy } });
  }
}

export async function deleteRoleById(id: string) {
  try {
    return await Role.findByIdAndDelete(id);
  } catch (error) {
    throw fmtErr(error, { msg: ROLE_MSGS.ERR.FAILED_TO_DELETE_ROLE, apiName: 'deleteRoleById', debugValues: { id } });
  }
}