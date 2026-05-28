import jwt from 'jsonwebtoken';
import type { SessionManager } from '../core/core-clients/session-manager.client';
import { ACCESSTOKEN_EXPIRY, EMAIL_SEND_FROM } from '../core/core-constants/common.constants';
import type { SecretManager } from '../core/core-clients/secret-manager.client';
import { IUserAccesstokenDetails } from '../interface/user-interface';
import { AuthRequest } from '../interface/authn.interface';
import { AppError } from '../core/core-utils/err-util';
import { AUTHN_MSGS } from '../constants';
import { loadTemplateHtml } from '../core/core-helper/ejs-template-loader.helper';
import { sendSesEmail } from '../core/core-helper';
export class AuthnService {

  private jwtExpiryTime = (process.env.APP_ENV || '').toLowerCase() === 'prod' ? ACCESSTOKEN_EXPIRY.prod : ACCESSTOKEN_EXPIRY.dev;

  constructor(
    private secretManager: SecretManager,
    private sessionManager: SessionManager,
  ) { }

  generateOtp = async (): Promise<string> => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
  };

  generateAccessToken = async (user: IUserAccesstokenDetails, sessionId: string): Promise<string> => {
    const JWT_SECRET = await this.secretManager.get('JWT_SECRET');
    return jwt.sign({ ...user, sessionId }, JWT_SECRET, { expiresIn: Number(this.jwtExpiryTime) });
  };

  verifyToken = async (token: string): Promise<AuthRequest> => {
    try {
      const JWT_SECRET = await this.secretManager.get('JWT_SECRET');
      return jwt.verify(token, JWT_SECRET) as AuthRequest;
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.TOKEN_EXPIRED, apiName: 'verifyToken' });
      }
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.INVALID_TOKEN, apiName: 'verifyToken' });
    }
  };

  decodeToken = async (token: string): Promise<AuthRequest> => {
    try {
      const response = jwt.decode(token, { complete: true, json: true });

      return response?.payload as AuthRequest;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.INVALID_TOKEN, apiName: 'decodeToken' });
    }
  };

  authenticate = async (accesstoken: string) => {
    try {
      const token = accesstoken?.split(' ')[1]; // Extract token from Authorization header
      if (!token) {
        throw new AppError(AUTHN_MSGS.ERR.TOKEN_MISSING, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'authenticate.no_accesstoken', debugValues: { token } });
      }
      const payload = await this.verifyToken(token); // Verify JWT token
      if (!payload) {
        throw new AppError(AUTHN_MSGS.ERR.INVALID_TOKEN, { msg: AUTHN_MSGS.ERR.INVALID_TOKEN, apiName: 'authenticate.invalid_token', debugValues: { token } });
      }
      const { userId, sessionId, name, email } = payload;
      // Check Redis for the session IDs associated with the userId
      const storedSessionIds = await this.sessionManager.get(userId as string);
      if (!storedSessionIds || !storedSessionIds.includes(sessionId as string)) {
      }

      return { userId, sessionId, name, email };
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, apiName: 'authenticate', debugValues: { error } });
    }
  };

  sendOtp = async (email: string, otp: string) => {
    try {
      const templatePayload = { otp, email };
      const templateHtml = await loadTemplateHtml('otp.email.ejs', templatePayload);
      await sendSesEmail(EMAIL_SEND_FROM, email, [], [], 'Fortlio OTP ', [], templateHtml, undefined);
      // sendSesEmail(process.env.EMAIL_SEND_FROM, email, [], [], 'Payment Confirmation - Next Steps for Your Oben Motorcycle Purchase', templateHtml, [{ filename: `transact-${transaction._id}.pdf`, content: buffer, contentType: 'application/pdf' }], undefined),
      return;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_SEND_OTP, apiName: 'sendOtp', debugValues: { email } });
    }
  };
}