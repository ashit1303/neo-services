import * as z from 'zod';

export const MobileNumberValidation = z.object({
  mobileNumber: z.string().trim().length(12, 'Mobile Number must be 12 characters long'),
});

export const VerifyOtpValidation = z.object({
  mobileNumber: z.string().trim().length(12, 'Mobile Number must be 12 characters long'),
  otp: z.string().trim().length(4, 'OTP must be 4 characters long'),
});

export const TokenValidation = z.object({
  token: z.string().trim().min(1, 'Token is required').max(500, 'Token must be less than 500 characters'),
});
