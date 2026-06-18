import { z } from './zod';
import { IdValidation } from './common-validation';

export const CandidateIdValidation = IdValidation('candidateId');
export const CandidateUserIdValidation = IdValidation('userId');
export const CandidateProfileParamsValidation = z.object({ userId: CandidateUserIdValidation });

export const CandidateProfileUpsertValidation = z.object({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }).max(100, { message: 'Full name must be less than 100 characters' }),
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100, { message: 'Email must be less than 100 characters' }),
  mobileNumber: z.string().trim().max(20, { message: 'Mobile number must be less than 20 characters' }).optional(),
  skills: z.array(z.string().trim()).optional(),
  githubUrl: z.string().trim().url({ message: 'Invalid GitHub URL' }).or(z.literal('')).optional(),
  linkedinUrl: z.string().trim().url({ message: 'Invalid LinkedIn URL' }).or(z.literal('')).optional(),
  portfolioUrl: z.string().trim().url({ message: 'Invalid Portfolio URL' }).or(z.literal('')).optional(),
  resumeUrl: z.string().trim().url({ message: 'Invalid Resume URL' }).or(z.literal('')).optional(),
  experience: z.number().min(0, { message: 'Experience must be a positive number' }).optional(),
  bio: z.string().max(2000, { message: 'Bio must be less than 2000 characters' }).optional(),
});

export const CandidateBlogCreateValidation = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }).max(200, { message: 'Title must be less than 200 characters' }),
  content: z.string().trim().min(1, { message: 'Content is required' }),
  blogKeywords: z.array(z.string().trim()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const CandidateBlogUpdateValidation = z.object({
  blogId: IdValidation('blogId'),
  title: z.string().trim().min(1, { message: 'Title is required' }).max(200, { message: 'Title must be less than 200 characters' }).optional(),
  content: z.string().trim().min(1, { message: 'Content is required' }).optional(),
  blogKeywords: z.array(z.string().trim()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const CandidateSearchValidation = z.object({
  searchKey: z.string().trim().min(1, { message: 'Search key is required' }).max(100, { message: 'Search key must be less than 100 characters' }),
});
