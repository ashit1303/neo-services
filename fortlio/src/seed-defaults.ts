import Role from './models/role.model';
import { ObjectId } from 'mongodb';
import { customerDefaultAccess, privilegesAllDefault } from './core/core-helper/default-role-access';
import User from './models/user.model';
import Privilege from './models/privilege.model';
import { DB_CONSTANTS } from './core/core-constants/mongodb.constants';
import { fmtPrntErr } from './core/core-utils/err-util';

function checkPrivilegesDuplicates() {
  const privilegesCodes = privilegesAllDefault.map(a => a.code);

  const duplicateCodes = [...new Set(
    privilegesCodes.filter((item, index) => privilegesCodes.indexOf(item) !== index),
  )];
  if (duplicateCodes.length > 0) {
    console.error(`Duplicate privileges found: ${duplicateCodes.join(', ')}`);
    process.exit(2);
  }
  return true;
}

export async function initializeDefaultRoles() {
  try {
    // check duplicates in privileges
    checkPrivilegesDuplicates();
    // create all Privilege
    const promises = privilegesAllDefault.map(async (privilege) => Privilege.findOneAndUpdate({ code: privilege.code }, privilege, { upsert: true, new: true }));
    await Promise.all(promises);
    const customerRole = await Role.findOne({ roleName: DB_CONSTANTS.DEFAULT_ROLE_CUSTOMER });
    const adminRole = await Role.findOne({ roleName: DB_CONSTANTS.DEFAULT_ROLE_ADMIN });

    if (!customerRole) {
      await Role.create({
        _id: new ObjectId(DB_CONSTANTS.DEFAULT_ROLE_CUSTOMER_ID),
        roleName: DB_CONSTANTS.DEFAULT_ROLE_CUSTOMER,
        description: DB_CONSTANTS.DEFAULT_ROLE_CUSTOMER_DESCRIPTION,
        rolePrivileges: customerDefaultAccess,
      });
      console.info(`Default role "${DB_CONSTANTS.DEFAULT_ROLE_CUSTOMER}" added.`);
    } else {
      // TODO : remove this else block once it's in production 
      await Role.updateOne({ roleName: DB_CONSTANTS.DEFAULT_ROLE_CUSTOMER }, { $set: { rolePrivileges: customerDefaultAccess } });
    }

    if (!adminRole) {
      await Role.create({
        _id: new ObjectId(DB_CONSTANTS.DEFAULT_ROLE_ADMIN_ID),
        roleName: DB_CONSTANTS.DEFAULT_ROLE_ADMIN,
        description: DB_CONSTANTS.DEFAULT_ROLE_ADMIN_DESCRIPTION,
      });
      console.info(`Default role "${DB_CONSTANTS.DEFAULT_ROLE_ADMIN}" added.`);
    } else {
      await Role.updateOne({ roleName: DB_CONSTANTS.DEFAULT_ROLE_ADMIN }, { $set: { rolePrivileges: privilegesAllDefault.map((access) => access.code) } });
    }

  } catch (error) {
    throw fmtPrntErr(error, 400, { apiName: 'initializeDefaultRoles' });
  }
}

export async function initializeDefaultUsers() {
  try {
    const filter = { _id: DB_CONSTANTS.DEFAULT_SYSTEM_ADMIN_ID };
    const update = { _id: DB_CONSTANTS.DEFAULT_SYSTEM_ADMIN_ID, email: DB_CONSTANTS.DEFAULT_SYSTEM_ADMIN_EMAIL, firstName: DB_CONSTANTS.DEFAULT_SYSTEM_ADMIN.split(' ')[0], lastName: DB_CONSTANTS.DEFAULT_SYSTEM_ADMIN.split(' ')[1], mobileNumber: DB_CONSTANTS.DEFAULT_SYSTEM_ADMIN_MOBILE, roleId: DB_CONSTANTS.DEFAULT_ROLE_ADMIN_ID };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    await User.findOneAndUpdate(filter, update, options);
  } catch (error) {
    throw fmtPrntErr(error, 400, { apiName: 'initializeDefaultUsers' });
  }
}