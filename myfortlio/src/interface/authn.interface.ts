export interface AuthRequest extends Request {
  userId?: string;
  name?: string;
  role?: string;
  sessionId?: string;
}
