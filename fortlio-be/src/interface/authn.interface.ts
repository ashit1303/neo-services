import type { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  name?: string;
  email?: string;
  sessionId?: string;
  role?: string;
}
