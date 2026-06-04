import type { AuthnService } from '../services/authn.services';
import { Request, Response } from 'express';
import { AppError } from '../core/core-utils/err-util';
import { AUTHN_MSGS } from '../constants';
import { fmtRes } from '../core/core-utils/res-util';

// const sessionManager = SessionManager.getInstance();
// const internalEmailUsers = [
//   { email: 'abc@xyz.com', userId: '67c7d967648aabae1c5745bc', otpDev: '7465', otpProd: '9687' },
//   { email: 'xyz@abc.com', userId: '67c7e79f648aabae1c5745c0', otpDev: '7465', otpProd: '9687' },
//   { email: 'abc@abc.com', userId: '692ebe5352de7b1f6d122c26', otpDev: '1111', otpProd: '7171' },
// ];
export class AuthnController {

  constructor(private authnService: AuthnService) { }

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authnService.register(req.body);

      return fmtRes(res, result);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_REGISTER, apiName: 'register' }, 400);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authnService.login({ email, password });
      return fmtRes(res, result);
    } catch (error: any) {
      throw new AppError(error.message || 'login failed', { msg: AUTHN_MSGS.ERR.FAILED_TO_LOGIN, apiName: 'login' }, 400);
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;
      const result = await this.authnService.verifyEmail(token);
      return fmtRes(res, result);
    } catch (error: any) {
      throw new AppError(error.message || 'verify email failed', { msg: AUTHN_MSGS.ERR.FAILED_TO_VERIFY_EMAIL, apiName: 'verifyEmail' }, 400,
      );
    }
  };

  resendVerification = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await this.authnService.resendVerification(email);
      return fmtRes(res, result);
    } catch (error: any) {
      throw new AppError(error.message || 'resend failed', { msg: AUTHN_MSGS.ERR.FAILED_TO_RESEND_VERIFICATION, apiName: 'resendVerification' }, 400);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) { throw new AppError(AUTHN_MSGS.ERR.TOKEN_MISSING, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'refreshToken' }); }

      const refreshToken = authHeader.split(' ')[1];

      if (!refreshToken) { throw new AppError(AUTHN_MSGS.ERR.TOKEN_MISSING, { msg: AUTHN_MSGS.ERR.TOKEN_MISSING, apiName: 'refreshToken' }); }
      const result = await this.authnService.refreshToken(refreshToken);

      return fmtRes(res, result);

    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_REFRESH_TOKEN, apiName: 'refreshToken' }, 400);
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId: string };

      if (!userId) {
        throw new AppError(AUTHN_MSGS.ERR.USER_ID_REQUIRED, { msg: 'userId required', apiName: 'logout' });
      }
      await this.authnService.logout(userId);
      return fmtRes(res, { message: AUTHN_MSGS.RES.LOGOUT_SUCCESS });

    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AUTHN_MSGS.ERR.FAILED_TO_LOGOUT_USER, apiName: 'logout' }, 400);
    }
  };
}

// User
//    = business/profile data

// UserPrivate
//    = authentication/security data

// CandidateProfile
//    = candidate details

// HRProfile
//    = recruiter details