import { z } from './zod';
import { IdValidation } from './common-validation';

export const HrProfileParamsValidation = z.object({ userId: IdValidation('userId') });

export const HrProfileUpsertValidation = z.object({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }).max(100, { message: 'Full name must be less than 100 characters' }),
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100, { message: 'Email must be less than 100 characters' }),
  mobileNumber: z.string().trim().max(20, { message: 'Mobile number must be less than 20 characters' }).optional(),
  companyName: z.string().trim().max(100, { message: 'Company name must be less than 100 characters' }).optional(),
  companyWebsite: z.string().trim().url({ message: 'Invalid Company Website URL' }).or(z.literal('')).optional(),
  designation: z.string().trim().max(100, { message: 'Designation must be less than 100 characters' }).optional(),
});
