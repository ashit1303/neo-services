import { z } from './zod';

import { IdValidation } from './common-validation';

export const UserIdValidation = IdValidation('userId');
// z.object({ userId: IdValidation('userId') });
export const MobileNumberValidation = z.string().trim().length(12, { message: 'Mobile number must be 12 digits' });

export const UserCreateValidation = z.object({
  firstName: z.string().trim().min(1, { message: 'First name is required' }).max(50, { message: 'First name must be less than 50 characters' }).transform(val => val.replace(/\s+/g, ' ').split(' ').map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ')),
  lastName: z.string().trim().min(1, { message: 'Last name is required' }).max(50, { message: 'Last name must be less than 50 characters' }).transform(val => val.replace(/\s+/g, ' ').split(' ').map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ')),
  mobileNumber: MobileNumberValidation,
  email: z.email('Invalid email address').max(100, 'Email must be less than 100 characters').or(z.literal('')).optional(),
  roleId: IdValidation('roleId').optional(),
  status: z.boolean({ message: 'Status is required' }).optional(),
});

export const UserUpdateValidation = z.object({
  userId: UserIdValidation,
  firstName: z.string().trim().min(1, { message: 'First name is required' }).max(50, { message: 'First name must be less than 50 characters' }).optional().transform(val => {
    if (!val) { return undefined; }
    return val.replace(/\s+/g, ' ').split(' ').map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ');
  }),
  lastName: z.string().trim().min(1, { message: 'Last name is required' }).max(50, { message: 'Last name must be less than 50 characters' }).optional().transform(val => {
    if (!val) { return undefined; }
    return val.replace(/\s+/g, ' ').split(' ').map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ');
  }),
  mobileNumber: MobileNumberValidation.optional(),
  email: z.email('Invalid email address').max(100, 'Email must be less than 100 characters').or(z.literal('')).optional(),
  roleId: IdValidation('roleId').optional(),
  status: z.boolean({ message: 'Status is required' }).optional(),
});

export const UserStatusUpdate = z.object({
  userId: UserIdValidation,
  status: z.boolean({ message: 'Status is required' }),
});