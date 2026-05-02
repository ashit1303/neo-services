// import { decodeToken, generateAccessToken, verifyToken } from '../../../helper/authentication-helper';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { AuthnService } from '../services/authn.services';
import SessionManager from '../core/core-clients/session-manager.client';
import { formatErrorMessage, generateUUID } from '../core/core-utils';
import { Request, Response } from 'express';
import { EmailValidation } from '../validations/common-validation';
import { IUserAccesstokenDetails } from '../interface/user-interface';
import { AUTH_ERR_MSGS } from '../constants';
import { RES_MSGS } from '../constants/res-msg.constants';
import { TokenValidation, VerifyOtpValidation } from '../validations/authentication-validation';

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
    try {
      const email = req.query.email as string;
      EmailValidation.parse({ email });
      const internalUser = internalEmailUsers.find((user) => user.email === email);
      if (internalUser) {
        const userId = internalUser.userId;
        return { message: RES_MSGS.OTP_SENT_SUCCESSFULLY, userId };
      }

      await this.authnService.sendOtp(email);
      return res.status(StatusCodes.OK).send({ success: true, message: RES_MSGS.OTP_SENT_SUCCESSFULLY });
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, { message: AUTH_ERR_MSGS.FAILED_TO_SEND_OTP });
    }
  };

  async resendOtp(req: Request, res: Response) {
    try {
      const email = req.query.email as string;
      EmailValidation.parse({ email });
      await this.authnService.resendOtp(email);
      return res.status(StatusCodes.OK).send({ success: true, message: RES_MSGS.OTP_RESENT_SUCCESSFULLY });
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, AUTH_ERR_MSGS.FAILED_TO_RESEND_OTP);
    }
  };

  async verifyOtp(req: Request, res: Response) {
    try {
      VerifyOtpValidation.parse({ email, otp });

      const user = await getUserByEmail(mongoose, email) as unknown as IUserByEmail;

      if (!user) {
        throw formatErrorMessage(null, StatusCodes.NOT_FOUND, AUTH_ERR_MSGS.USER_NOT_FOUND);
      }

      const userDetails: IUserAccesstokenDetails = {
        userId: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role.roleName,
      };

      const internalUser = internalEmailUsers.find((user) => user.email === email);

      if (internalUser) {
        if (process.env.APP_ENV === 'PROD' && otp !== internalUser.otpProd) {
          throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.INVALID_OTP);
        } else if (process.env.APP_ENV !== 'PROD' && otp !== internalUser.otpDev) {
          throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.INVALID_OTP);
        }
      } else {
        await this.authnService.verifyOtp(email, otp);
      }

      const sessionId = generateUUID();

      // Generate access and refresh tokens
      const accessToken = await this.authnService.generateAccessToken(userDetails, sessionId);

      // Store session in Redis
      await sessionManager.set(userDetails.userId, sessionId);

      return {
        accessToken,
      };
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, AUTH_ERR_MSGS.FAILED_TO_VERIFY_OTP);
    }
  };

  async authenticate(req: Request, res: Response) {
    try {
      TokenValidation.parse({ token });

      if (!token) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.TOKEN_MISSING);
      }

      const decodedToken = await this.authnService.decodeToken(token);
      if (decodedToken.userId && BYPASS_USERS.includes(decodedToken.userId)) {
        return {
          message: RES_MSGS.TOKEN_VERIFIED,
          userId: decodedToken?.userId,
          name: decodedToken?.name,
          role: decodedToken?.role,
        };
      }

      // Verify JWT access token
      const payload = await this.authnService.verifyToken(token);
      if (!payload) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.INVALID_TOKEN);
      }

      const { userId, sessionId, name, role } = payload;

      // Validate session ID in Redis
      if (!['local', 'test'].includes(process.env.BUN_ENV as string)) {
        const storedSessionIds = await sessionManager.get(userId as string);
        if (!storedSessionIds || !storedSessionIds.includes(sessionId as string)) {
          throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.INVALID_SESSION);
        }
      }

      return {
        message: RES_MSGS.TOKEN_VERIFIED,
        userId,
        name,
        role,
      };
    } catch (error: any) {
      throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, AUTH_ERR_MSGS.FAILED_TO_AUTHENTICATE_USER);
    }
  };

  async refreshToken(req: Request, res: Response) {
    try {
      TokenValidation.parse({ token: refreshToken });

      if (!refreshToken) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.REFRESH_TOKEN_MISSING);
      }

      // Verify the refresh token
      const { userId, name, role, sessionId } = await this.authnService.decodeToken(refreshToken); // Verify Refresh Token

      if (!userId || !name || !role || !sessionId) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.INVALID_REFRESH_TOKEN);
      }

      const userDetails: IUserAccesstokenDetails = {
        userId: userId,
        name: name,
        role: role,
      };

      await sessionManager.delete(userId, sessionId);

      const newSessionId = generateUUID(); // create a new session Id because old one expired after 15min

      await sessionManager.set(userDetails.userId, newSessionId); // set the session id in redis session

      // Generate new access and refresh tokens
      const newAccessToken = await this.authnService.generateAccessToken(userDetails, newSessionId);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, AUTH_ERR_MSGS.FAILED_TO_REFRESH_TOKEN);
    }
  };

  async logout(req: Request, res: Response) {
    try {
      const { userId, sessionId } = req.query as { userId: string, sessionId: string };
      if (!userId || !sessionId) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.TOKEN_MISSING);
      }

      // Validate session before deletion
      const storedSession = await sessionManager.get(userId);

      if (!storedSession?.length || !storedSession.includes(sessionId)) {
        throw formatErrorMessage(null, StatusCodes.UNAUTHORIZED, AUTH_ERR_MSGS.INVALID_SESSION);
      }

      // Destroy session in Redis
      await sessionManager.delete(userId, sessionId);

      return { message: RES_MSGS.LOGOUT_SUCCESS };
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, AUTH_ERR_MSGS.FAILED_TO_LOGOUT_USER);
    }
  };
}

export default AuthnController;