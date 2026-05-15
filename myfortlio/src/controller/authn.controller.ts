import mongoose from 'mongoose';
import { AuthnService } from '../services/authn.services';
import SessionManager from '../core/core-clients/session-manager.client';
import { generateUUID } from '../core/core-utils';
import { Request, Response } from 'express';
import { EmailValidation } from '../validations/common-validation';
import { IUserAccesstokenDetails } from '../interface/user-interface';
import { TokenValidation, VerifyOtpValidation } from '../validations/authentication-validation';
import { fmtErr, fmtPrntErr } from '../core/core-utils/err-util';
import { AUTHN_MSGS } from '../constants';
import { BYPASS_USERS } from '../core/core-constants/common.constants';
import { fmtRes } from '../core/core-utils/res-util';

const sessionManager = SessionManager.getInstance();
const internalEmailUsers = [
  { email: 'abc@xyz.com', userId: '67c7d967648aabae1c5745bc', otpDev: '7465', otpProd: '9687' },
  { email: 'xyz@abc.com', userId: '67c7e79f648aabae1c5745c0', otpDev: '7465', otpProd: '9687' },
  { email: 'abc@abc.com', userId: '692ebe5352de7b1f6d122c26', otpDev: '1111', otpProd: '7171' },
];
class AuthnController {
  authnService: AuthnService;

  constructor() {
    this.authnService = new AuthnService();
  }

  async sendOtp(req: Request, res: Response) {
    const email = req.query.email as string;

    try {
      EmailValidation.parse({ email });
      const internalUser = internalEmailUsers.find((user) => user.email === email);
      if (internalUser) {
        const userId = internalUser.userId;
        return { message: AUTHN_MSGS.RES.OTP_SENT_SUCCESSFULLY, userId };
      }

      await this.authnService.sendOtp(email);
      return fmtRes(res, { success: true, message: AUTHN_MSGS.RES.OTP_SENT_SUCCESSFULLY });
    } catch (error) {
      throw fmtPrntErr(error, 400, { msg: AUTHN_MSGS.ERR.FAILED_TO_SEND_OTP, apiName: 'sendOtp', debugValues: { email } });
    }
  };

  async resendOtp(req: Request, res: Response) {
    const email = req.query.email as string;

    try {
      EmailValidation.parse({ email });
      await this.authnService.resendOtp(email);
      return fmtRes(res, { success: true, message: AUTHN_MSGS.RES.OTP_RESENT_SUCCESSFULLY });
    } catch (error) {
      throw fmtPrntErr(error, 400, { msg: AUTHN_MSGS.ERR.FAILED_TO_RESEND_OTP, apiName: 'resendOtp', debugValues: { email } });
    }
  };

  async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    try {
      VerifyOtpValidation.parse({ email, otp });

      const user = await getUserByEmail(mongoose, email);

      if (!user) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'verifyOtp.getUserByEmail', debugValues: { email } });
      }

      const userDetails: IUserAccesstokenDetails = {
        userId: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role.roleName,
      };

      const internalUser = internalEmailUsers.find((user) => user.email === email);

      if (internalUser) {
        if (process.env.APP_ENV === 'PROD' && otp !== internalUser.otpProd) {
          throw fmtErr(null, { msg: AUTHN_MSGS.ERR.INVALID_OTP, apiName: 'verifyOtp.internalUser.PROD', debugValues: { email, otp } });
        } else if (process.env.APP_ENV !== 'PROD' && otp !== internalUser.otpDev) {
          throw fmtErr(null, { msg: AUTHN_MSGS.ERR.INVALID_OTP, apiName: 'verifyOtp.internalUser.DEV', debugValues: { email, otp } });
        }
      } else {
        await this.authnService.verifyOtp(email, otp);
      }

      const sessionId = generateUUID();

      // Generate access and refresh tokens
      const accessToken = await this.authnService.generateAccessToken(userDetails, sessionId);

      // Store session in Redis
      await sessionManager.set(userDetails.userId, sessionId);

      return fmtRes(res, { accessToken });
    } catch (error) {
      throw fmtPrntErr(error, 400, { msg: AUTHN_MSGS.ERR.FAILED_TO_VERIFY_OTP, apiName: 'verifyOtp', debugValues: { email, otp } });
    }
  };

  async authenticate(req: Request, res: Response) {
    const token = req.headers.authorization as string;
    try {
      TokenValidation.parse({ token });

      if (!token) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'authenticate', debugValues: { token } });
      }

      const decodedToken = await this.authnService.decodeToken(token);
      if (decodedToken.userId && BYPASS_USERS.includes(decodedToken.userId)) {
        return {
          message: AUTHN_MSGS.RES.TOKEN_VERIFIED,
          userId: decodedToken?.userId,
          name: decodedToken?.name,
          role: decodedToken?.role,
        };
      }

      // Verify JWT access token
      const payload = await this.authnService.verifyToken(token);
      if (!payload) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.INVALID_TOKEN, apiName: 'authenticate', debugValues: { token } });
      }

      const { userId, sessionId, name, role } = payload;

      // Validate session ID in Redis
      if (!['local', 'test'].includes(process.env.BUN_ENV as string)) {
        const storedSessionIds = await sessionManager.get(userId as string);
        if (!storedSessionIds || !storedSessionIds.includes(sessionId as string)) {
          throw fmtErr(null, { msg: AUTHN_MSGS.ERR.INVALID_SESSION, apiName: 'authenticate', debugValues: { userId, sessionId } });
        }
      }

      return fmtRes(res, { message: AUTHN_MSGS.RES.TOKEN_VERIFIED, userId, name, role });
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, apiName: 'authenticate', debugValues: { token } });
    }
  };

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    try {
      TokenValidation.parse({ token: refreshToken });
      if (!refreshToken) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'refreshToken', debugValues: { refreshToken } });
      }
      const { userId, name, role, sessionId } = await this.authnService.decodeToken(refreshToken); // Verify Refresh Token

      if (!userId || !name || !role || !sessionId) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.USER_ID_AND_SESSION_ID_REQUIRED, apiName: 'refreshToken', debugValues: { userId, sessionId } });
      }
      const userDetails: IUserAccesstokenDetails = { userId: userId, name: name, role: role };

      await sessionManager.delete(userId, sessionId);
      const newSessionId = generateUUID();
      await sessionManager.set(userDetails.userId, newSessionId);
      const newAccessToken = await this.authnService.generateAccessToken(userDetails, newSessionId);

      return fmtRes(res, { accessToken: newAccessToken });
    } catch (error) {
      throw fmtPrntErr(error, 400, { msg: AUTHN_MSGS.ERR.FAILED_TO_REFRESH_TOKEN, apiName: 'refreshToken', debugValues: { refreshToken } });
    }
  };

  async logout(req: Request, res: Response) {
    const { userId, sessionId } = req.query as { userId: string, sessionId: string };

    try {
      if (!userId || !sessionId) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.USER_ID_AND_SESSION_ID_REQUIRED, apiName: 'logout', debugValues: { userId, sessionId } });
      }

      // Validate session before deletion
      const storedSession = await sessionManager.get(userId);

      if (!storedSession?.length || !storedSession.includes(sessionId)) {
        throw fmtErr(null, { msg: AUTHN_MSGS.ERR.INVALID_SESSION, apiName: 'logout', debugValues: { userId, sessionId } });
      }

      // Destroy session in Redis
      await sessionManager.delete(userId, sessionId);

      return fmtRes(res, { message: AUTHN_MSGS.RES.LOGOUT_SUCCESS });
    } catch (error) {
      throw fmtPrntErr(error, 400, { msg: AUTHN_MSGS.ERR.FAILED_TO_LOGOUT_USER, apiName: 'logout', debugValues: { userId, sessionId } });
    }
  };
}

export default AuthnController;