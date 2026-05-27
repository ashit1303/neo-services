import { UserIdValidation } from './user-validation';
import { z } from './zod';
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const VerifyOtpValidation = z.object({
  email: z.string().trim().regex(emailRegex, 'Invalid email format'),
  otp: z.string().trim().length(6, 'OTP must be 6 characters long'),
});

export const TokenValidation = z.object({
  token: z.string().trim().min(1, 'Token is required').max(500, 'Token must be less than 500 characters'),
});

export const SendOtpValidation = z.object({
  email: z.string().trim().regex(emailRegex, 'Invalid email format'),
  fullName: z.string().trim().min(1, 'Full name is required').max(255, 'Full name must be less than 255 characters'),
});

export const LogoutValidation = z.object({
  userId: UserIdValidation,
  sessionId: z.string().trim().min(1, 'Session ID is required').max(255, 'Session ID must be less than 255 characters'),

});