import { AuthnService } from '../services/authn.services';
import SessionManager from '../core/core-clients/session-manager.client';
import { generateRandomNumber, generateUUID } from '../core/core-utils';
import { Request, Response } from 'express';
import { EmailValidation } from '../validations/common-validation';
import { IUserAccesstokenDetails } from '../interface/user-interface';
import { LogoutValidation, SendOtpValidation, TokenValidation, VerifyOtpValidation } from '../validations/authn-validation';
import { AppError } from '../core/core-utils/err-util';
import { AUTHN_MSGS } from '../constants';
import { BYPASS_USERS } from '../core/core-constants/common.constants';
import { fmtRes } from '../core/core-utils/res-util';
import UserOTP from '../models/user-otp.model';
import dayjs from 'dayjs';
import User from '../models/user.model';

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

  sendOtp = async (req: Request, res: Response) => {
    const { email, fullName } = req.query as { email: string; fullName: string };
    try {
      SendOtpValidation.parse({ email, fullName });
      const internalUser = internalEmailUsers.find((user) => user.email === email);
      if (internalUser) {
        return fmtRes(res, { success: true, message: AUTHN_MSGS.RES.OTP_SENT_SUCCESSFULLY });
      }
      const user = await User.findOneAndUpdate({ email }, { fullName }, { upsert: true, new: true }).lean();
      const otp = generateRandomNumber(6);
      await UserOTP.findOneAndUpdate({ userId: user._id }, { userId: user._id, otp, expiryAt: dayjs().add(30, 'minute').toISOString(), updatedAt: new Date() }, { upsert: true, new: true });
      await this.authnService.sendOtp(email, otp);
      return fmtRes(res, { success: true, message: AUTHN_MSGS.RES.OTP_SENT_SUCCESSFULLY });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_SEND_OTP, apiName: 'sendOtp', debugValues: { email } }, 400);
    }
  };

  resendOtp = async (req: Request, res: Response) => {
    const email = req.query.email as string;
    try {
      EmailValidation.parse({ email });
      const internalUser = internalEmailUsers.find((user) => user.email === email);
      if (internalUser) {
        return fmtRes(res, { success: true, message: AUTHN_MSGS.RES.OTP_SENT_SUCCESSFULLY });
      }
      const user = await User.findOne({ email }).lean();
      if (!user) {
        throw new AppError(AUTHN_MSGS.ERR.USER_NOT_FOUND, { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'resendOtp', debugValues: { email } });
      }
      const userOtp = await UserOTP.findOne({ userId: user._id.toString() }).lean();
      if (!userOtp) {
        throw new AppError(AUTHN_MSGS.ERR.USER_NOT_FOUND, { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'resendOtp', debugValues: { email } });
      }
      await this.authnService.sendOtp(email, userOtp.otp);
      return fmtRes(res, { success: true, message: AUTHN_MSGS.RES.OTP_RESENT_SUCCESSFULLY });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_RESEND_OTP, apiName: 'resendOtp', debugValues: { email } }, 400);
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    try {
      VerifyOtpValidation.parse({ email, otp });
      const internalUser = internalEmailUsers.find((user) => user.email === email);

      if (internalUser) {
        if (process.env.BUN_ENV === 'prod' && otp !== internalUser.otpProd) {
          throw new AppError(AUTHN_MSGS.ERR.INVALID_OTP, { msg: AUTHN_MSGS.ERR.INVALID_OTP, apiName: 'verifyOtp.internalUser.PROD', debugValues: { email, otp } });
        } else if (process.env.BUN_ENV !== 'prod' && otp !== internalUser.otpDev) {
          throw new AppError(AUTHN_MSGS.ERR.INVALID_OTP, { msg: AUTHN_MSGS.ERR.INVALID_OTP, apiName: 'verifyOtp.internalUser.DEV', debugValues: { email, otp } });
        }
      }

      const user = await User.findOne({ email }).lean();
      if (!user) {
        throw new AppError(AUTHN_MSGS.ERR.USER_NOT_FOUND, { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'resendOtp', debugValues: { email } });
      }
      const userOtp = await UserOTP.findOne({ userId: user._id.toString() }).lean();
      if (!userOtp) {
        throw new AppError(AUTHN_MSGS.ERR.USER_NOT_FOUND, { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'resendOtp', debugValues: { email } });
      }
      if (otp !== userOtp.otp) {
        throw new AppError(AUTHN_MSGS.ERR.INVALID_OTP, { msg: AUTHN_MSGS.ERR.INVALID_OTP, apiName: 'verifyOtp', debugValues: { email, otp } });
      }

      const userDetails: IUserAccesstokenDetails = {
        userId: user._id.toString(),
        name: user.fullName,
        email: user.email,
        // role: internalUser.role.roleName,
      };

      const sessionId = generateUUID();

      // Generate access and refresh tokens
      const accessToken = await this.authnService.generateAccessToken(userDetails, sessionId);

      // Store session in Redis
      await sessionManager.set(userDetails.userId, sessionId);

      return fmtRes(res, { accessToken });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_VERIFY_OTP, apiName: 'verifyOtp', debugValues: { email, otp } }, 400);
    }
  };

  authenticate = async (req: Request, res: Response) => {
    const token = req.headers.authorization as string;
    try {
      TokenValidation.parse({ token });

      if (!token) {
        throw new AppError(AUTHN_MSGS.ERR.TOKEN_MISSING, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'authenticate', debugValues: { token } }, 400);
      }
      const extractedToken = token.split(' ')[1];
      const decodedToken = await this.authnService.decodeToken(extractedToken);
      if (decodedToken.userId && BYPASS_USERS.includes(decodedToken.userId)) {
        return {
          message: AUTHN_MSGS.RES.TOKEN_VERIFIED,
          userId: decodedToken?.userId,
          name: decodedToken?.name,
          email: decodedToken?.email,
        };
      }

      // Verify JWT access token
      const payload = await this.authnService.verifyToken(extractedToken);
      if (!payload) {
        throw new AppError(AUTHN_MSGS.ERR.INVALID_TOKEN, { msg: AUTHN_MSGS.ERR.INVALID_TOKEN, apiName: 'authenticate', debugValues: { extractedToken } });
      }

      const { userId, sessionId, name, email } = payload;

      // Validate session ID in Redis
      if (!['local', 'test'].includes(process.env.BUN_ENV as string)) {
        const storedSessionIds = await sessionManager.get(userId as string);
        if (!storedSessionIds || !storedSessionIds.includes(sessionId as string)) {
          throw new AppError(AUTHN_MSGS.ERR.INVALID_SESSION, { msg: AUTHN_MSGS.ERR.INVALID_SESSION, apiName: 'authenticate', debugValues: { userId, sessionId } });
        }
      }

      return fmtRes(res, { message: AUTHN_MSGS.RES.TOKEN_VERIFIED, userId, name, email });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_AUTHENTICATE_USER, apiName: 'authenticate', debugValues: { token } }, 400);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.headers.authorization;
    try {
      TokenValidation.parse({ token });
      if (!token) {
        throw new AppError(AUTHN_MSGS.ERR.TOKEN_MISSING, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'refreshToken', debugValues: { token } });
      }
      const { userId, name, email, sessionId } = await this.authnService.decodeToken(token); // Verify Refresh Token

      if (!userId || !name || !email || !sessionId) {
        throw new AppError(AUTHN_MSGS.ERR.USER_ID_AND_SESSION_ID_REQUIRED, { msg: AUTHN_MSGS.ERR.USER_ID_AND_SESSION_ID_REQUIRED, apiName: 'refreshToken', debugValues: { userId, sessionId } });
      }
      const userDetails: IUserAccesstokenDetails = { userId: userId, name: name, email: email };

      await sessionManager.delete(userId, sessionId);
      const newSessionId = generateUUID();
      await sessionManager.set(userDetails.userId, newSessionId);
      const newAccessToken = await this.authnService.generateAccessToken(userDetails, newSessionId);

      return fmtRes(res, { accessToken: newAccessToken });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_REFRESH_TOKEN, apiName: 'refreshToken', debugValues: { token } }, 400);
    }
  };

  logout = async (req: Request, res: Response) => {
    const { userId, sessionId } = req.query as { userId: string, sessionId: string };

    try {
      LogoutValidation.parse({ userId, sessionId });

      // Validate session before deletion
      const storedSession = await sessionManager.get(userId);

      if (!storedSession?.length || !storedSession.includes(sessionId)) {
        throw new AppError(AUTHN_MSGS.ERR.INVALID_SESSION, { msg: AUTHN_MSGS.ERR.INVALID_SESSION, apiName: 'logout', debugValues: { userId, sessionId } });
      }

      // Destroy session in Redis
      await sessionManager.delete(userId, sessionId);

      return fmtRes(res, { message: AUTHN_MSGS.RES.LOGOUT_SUCCESS });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_LOGOUT_USER, apiName: 'logout', debugValues: { userId, sessionId } }, 400);
    }
  };
}

export default AuthnController;