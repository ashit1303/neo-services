
import * as z from 'zod';
import { IdValidation } from './common-validation';

export const RoleIdValidation = IdValidation('roleId');

export const RoleCreateValidation = z.object({
  roleName: z.string().trim().min(1, { message: 'Role name is required' }).max(100, { message: 'Role name must be less than 100 characters' }),
  description: z.string().trim().min(1, { message: 'Description is required' }).max(200, { message: 'Description must be less than 200 characters' }),
  rolePrivileges: z.array(z.string()),
});

export const RoleUpdateValidation = z.object({
  roleId: RoleIdValidation,
  roleName: z.string().trim().min(1, { message: 'Role name is required' }).max(100, { message: 'Role name must be less than 100 characters' }).optional(),
  description: z.string().trim().min(1, { message: 'Description is required' }).max(200, { message: 'Description must be less than 200 characters' }).optional(),
  rolePrivileges: z.array(z.string()).optional(),
});