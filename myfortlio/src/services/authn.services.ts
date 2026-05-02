import jwt from 'jsonwebtoken';
import SessionManager from '../core/core-clients/session-manager.client';
import { ACCESSTOKEN_EXPIRY } from '../core/core-constants/common.constants';
import { SecretManager } from '../core/core-clients/secret-manager.client';
import { config } from '../../config';
import { ERR_MSGS } from '../constants/authn-err-msg.constants';
import { IUserAccesstokenDetails } from '../interface/user-interface';
import { AuthRequest } from '../interface/authn.interface';
import { error } from 'console';
export class AuthnService {

  private secretManager;
  private sessionManager;
  private jwtExpiryTime = (process.env.APP_ENV || '').toLowerCase() === 'prod' ? ACCESSTOKEN_EXPIRY.prod : ACCESSTOKEN_EXPIRY.dev;

  constructor() {
    this.secretManager = new SecretManager(config);
    this.sessionManager = SessionManager.getInstance();
  }

  generateAccessToken = async (user: IUserAccesstokenDetails, sessionId: string): Promise<string> => {
    const JWT_SECRET = await this.secretManager.get('JWT_SECRET');
    return jwt.sign({ ...user, sessionId }, JWT_SECRET, { expiresIn: Number(this.jwtExpiryTime) });
  };

  verifyToken = async (token: string): Promise<AuthRequest> => {
    try {
      const JWT_SECRET = await this.secretManager.get('JWT_SECRET');
      return jwt.verify(token, JWT_SECRET) as AuthRequest;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error(ERR_MSGS.TOKEN_EXPIRED.msg);
      }
      throw new Error(ERR_MSGS.INVALID_TOKEN.msg);
    }
  };

  decodeToken = async (token: string): Promise<AuthRequest> => {
    try {
      const response = jwt.decode(token, { complete: true, json: true });

      return response?.payload as AuthRequest;
    } catch (error) {
      throw new Error(error?.message || ERR_MSGS.INVALID_TOKEN.msg);
    }
  };

  authenticate = async (accesstoken: string) => {
    try {
      const token = accesstoken?.split(' ')[1]; // Extract token from Authorization header
      if (!token) {
        throw new Error(error.message || ERR_MSGS.TOKEN_MISSING);
      }

      const payload = await this.verifyToken(token); // Verify JWT token
      if (!payload) {
        throw new Error(error.message || ERR_MSGS.INVALID_TOKEN);
      }

      const { userId, sessionId, name, role } = payload;

      // Check Redis for the session IDs associated with the userId
      const storedSessionIds = await this.sessionManager.get(userId as string);
      if (!storedSessionIds || !storedSessionIds.includes(sessionId as string)) {
        throw new Error(error.message || ERR_MSGS.INVALID_SESSION);
      }

      return { userId, sessionId, name, role };
    } catch (error) {
      throw error;
    }
  };
}