import { z } from './zod';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const IdValidation = (name: string) => z.string().trim().length(24, `${name} must be 24 characters long`);

export const DateValidation = (name: string) => z.preprocess(
  (arg) => {
    // Handle null/undefined/empty string
    if (arg === null || arg === undefined || (typeof arg === 'string' && arg.trim() === '')) {
      return undefined;
    }

    // If already a valid Date object
    if (arg instanceof Date) {
      if (!isNaN(arg.getTime())) {
        return arg;
      }
      return undefined;
    }

    // If string or number, try to parse
    if (typeof arg === 'string' || typeof arg === 'number') {
      // Reject obviously invalid strings
      if (typeof arg === 'string' && arg.trim().length === 0) {
        return undefined;
      }
      const date = new Date(arg);
      // Check for valid date: not NaN and not "Invalid Date"
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date;
      }
      return undefined;
    }

    // If arg is an object with a toDate method (e.g., dayjs.js)
    if (
      arg &&
      typeof arg === 'object' &&
      'toDate' in arg &&
      typeof (arg as { toDate: () => unknown }).toDate === 'function'
    ) {
      const date = (arg as { toDate: () => unknown }).toDate();
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date;
      }
      return undefined;
    }

    // All other types are invalid
    return undefined;
  },
  z.date({ message: `${name} is required and must be a valid date` }),
);

export const FilterQueryValidation = z.object({
  page: z.number().min(1, { message: 'Page must be greater than 0' }).optional(),
  limit: z.number().min(1, { message: 'Limit must be greater than 0' }).max(100, { message: 'Limit must be less than 100' }).optional(),
  sortBy: z.string().trim().min(1, { message: 'Sort by is required' }).max(100, { message: 'Sort by must be less than 100 characters' }).optional(),
  sortOrder: z.enum(['asc', 'desc'], { message: 'Sort order must be either asc or desc' }).optional(),
  search: z.string().trim().min(1, { message: 'Search is required' }).max(35, { message: 'Search must be less than 30 characters' }).optional(),
  fromDate: DateValidation('From date').optional(),
  toDate: DateValidation('To date').optional(),
  // filterKey: z.object({}).optional(),
}).optional();
export const EmailValidation = z.object({ email: z.string().trim().regex(emailRegex, { message: 'Invalid email format' }) });
