import z from 'zod';
import { openApiRegistry } from '../clients';
import { EmailValidation, FilterQueryValidation } from '../validations/common-validation';
import { RoleCreateValidation, RoleIdValidation, RoleUpdateValidation } from '../validations/role-validation';

export function registerRoleRoutes() {
  openApiRegistry.register('EmailValidation', EmailValidation);
  // /getRoles
  // /getRolesWithPrivileges
  // /getPrivileges
  // /getRoleById
  // /createRole
  // /updateRole
  // /deleteRole
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Roles'],
    path: '/role/getRoles',
    security: [{ bearerAuth: [] }],
    request: { query: FilterQueryValidation },
    responses: { 200: { description: 'Roles fetched' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Roles'],
    path: '/role/getRolesWithPrivileges',
    security: [{ bearerAuth: [] }],
    request: { query: FilterQueryValidation },
    responses: { 200: { description: 'Roles fetched with privileges' } },
  });
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Roles'],
    path: '/role/getPrivileges',
    security: [{ bearerAuth: [] }],
    request: { query: FilterQueryValidation },
    responses: { 200: { description: 'Privileges fetched' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Roles'],
    path: '/role/getRoleById/',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: FilterQueryValidation } } } },
    responses: { 200: { description: 'Role fetched by ID' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Roles'],
    path: '/role/createRole',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: RoleCreateValidation } } } },
    responses: { 201: { description: 'Role created' } },
  });

  openApiRegistry.registerPath({
    method: 'put',
    tags: ['Roles'],
    path: '/role/updateRole',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ roleId: RoleUpdateValidation }) },
    responses: { 200: { description: 'Role updated' } },
  });

  openApiRegistry.registerPath({
    method: 'delete',
    tags: ['Roles'],
    path: '/role/deleteRole/{roleId}', // ✅ correct
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ roleId: RoleIdValidation }) },
    responses: { 204: { description: 'Role deleted' } },
  });
}