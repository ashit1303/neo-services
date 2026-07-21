import jwt from 'jsonwebtoken';
import { ACCESSTOKEN_EXPIRY, EMAIL_SEND_FROM } from '../core/core-constants/common.constants';
import type { SecretManager } from '../core/core-clients/secret-manager.client';
import { IUserAccesstokenDetails } from '../interface/user-interface';
import { AuthRequest } from '../interface/authn.interface';
import { AppError } from '../core/core-utils/err-util';
import { AUTHN_MSGS } from '../constants';
import { loadTemplateHtml } from '../core/core-helper/ejs-template-loader.helper';
import type { SESHelper } from '../core/core-helper';
import UserPrivate from '../models/user-priv.model';
import User from '../models/user.model';
import { createHash, randomBytes } from 'crypto';
import { frontendBaseURL } from '../clients';
export class AuthnService {

  private jwtExpiryTime = (process.env.BUN_ENV || '').toLowerCase() === 'prod' ? ACCESSTOKEN_EXPIRY.prod : ACCESSTOKEN_EXPIRY.dev;

  constructor(
    private secretManager: SecretManager,
    private sesHelper: SESHelper,
  ) { }

  generateAccessToken = async (user: IUserAccesstokenDetails): Promise<string> => {
    const JWT_SECRET = await this.secretManager.get('JWT_SECRET');
    return jwt.sign(user, JWT_SECRET, { expiresIn: Number(this.jwtExpiryTime) });
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
  async register(payload: { email: string; password: string; fullName: string }) {
    const { email, password, fullName } = payload;
    const normalizedEmail = email.toLowerCase();
    const existing = await UserPrivate.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AppError('User already exists', { msg: 'User already exists', apiName: 'register', debugValues: { email } }, 409);
    }

    const passwordHash = await Bun.password.hash(password);
    const user = await User.create({ fullName, email: normalizedEmail, role: null, isOnboarded: false });

    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenHash = createHash('sha256').update(verificationToken).digest('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const refreshToken = randomBytes(64).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await UserPrivate.create({
      userId: user._id,
      passwordHash,
      provider: 'EMAIL',
      emailVerified: false,
      verificationTokenHash,
      verificationTokenExpiresAt,
      refreshTokenHash,
    });

    const verificationUrl = `${frontendBaseURL}/verify-email?token=${verificationToken}`;
    const templateHtml = await loadTemplateHtml('email-verification-link.ejs', { verificationUrl });
    await this.sesHelper.sendSesEmail(EMAIL_SEND_FROM, email, [], [], 'Fortlio OTP ', [], templateHtml, undefined);

    return {
      success: true,
      message: 'Verification email sent',
      // return refreshToken for auto-login

    };
  }

  async login(payload: { email: string; password: string }) {
    const { email, password } = payload;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AppError('Invalid credentials', { msg: 'Invalid credentials', apiName: 'login', debugValues: { email } });
    }
    const userPrivate = await UserPrivate.findOne({ userId: user._id });
    if (!userPrivate) {
      throw new AppError('Invalid credentials', { msg: 'Invalid credentials', apiName: 'login', debugValues: { email } });
    }
    const isValid = await Bun.password.verify(password, userPrivate.passwordHash);
    if (!isValid) { throw new AppError('Invalid credentials', { msg: 'Invalid credentials', apiName: 'login' }); }
    if (!userPrivate.emailVerified) { throw new AppError('Email not verified', { msg: 'Email not verified', apiName: 'login' }); }

    const accessToken = await this.generateAccessToken({ userId: user._id, email: user.email, name: user.fullName, roleId: user.roleId });
    const refreshToken = randomBytes(64).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await UserPrivate.updateOne({ _id: userPrivate._id }, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        roleId: user.roleId,
        isOnboarded: user.isOnboarded,
      },
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new AppError('Token missing', { msg: 'Token missing', apiName: 'verifyEmail' }, 400);
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const userPrivate = await UserPrivate.findOne({
      verificationTokenHash: tokenHash,
    });

    if (!userPrivate) {
      throw new AppError('Invalid or expired token', { msg: 'Invalid or expired token', apiName: 'verifyEmail' }, 400);
    }

    userPrivate.emailVerified = true;
    userPrivate.verificationTokenHash = undefined;
    userPrivate.verificationTokenExpiresAt = undefined;
    await userPrivate.save();

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerification(email: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new AppError('User not found', { msg: 'User not found', apiName: 'resendVerification' }, 404);
    }

    const userPrivate = await UserPrivate.findOne({ userId: user._id });
    if (!userPrivate) {
      throw new AppError('User not found', { msg: 'User not found', apiName: 'resendVerification' }, 404);
    }

    if (userPrivate.emailVerified) {
      return { success: true, message: 'Email already verified' };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    userPrivate.verificationTokenHash = tokenHash;
    userPrivate.verificationTokenExpiresAt = expiresAt;

    await userPrivate.save();

    // 5. Send email
    const verificationUrl = `${frontendBaseURL}/verify-email?token=${token}`;
    const templateHtml = await loadTemplateHtml('email-verification-link.ejs', { verificationUrl });
    await this.sesHelper.sendSesEmail(EMAIL_SEND_FROM, email, [], [], 'Fortlio OTP ', [], templateHtml, undefined);

    return { success: true, message: 'Verification email sent' };
  }

  async refreshToken(refreshToken: string) {
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const userPrivate = await UserPrivate.findOne({ refreshTokenHash });

    if (!userPrivate) {
      throw new AppError('Invalid refresh token', { msg: AUTHN_MSGS.ERR.INVALID_TOKEN, apiName: 'refreshToken' }, 401);
    }

    const user = await User.findById(userPrivate.userId);
    if (!user) {
      throw new AppError('User not found', { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'refreshToken' }, 404);
    }

    // Rotate refresh token
    const newRefreshToken = randomBytes(64).toString('hex');
    const newRefreshTokenHash = createHash('sha256').update(newRefreshToken).digest('hex');

    userPrivate.refreshTokenHash = newRefreshTokenHash;
    await userPrivate.save();

    const accessToken = await this.generateAccessToken({
      userId: user._id,
      email: user.email,
      name: user.fullName,
      roleId: user.roleId,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    const userPrivate = await UserPrivate.findOne({ userId });
    if (!userPrivate) {
      throw new AppError('User not found', { msg: AUTHN_MSGS.ERR.USER_NOT_FOUND, apiName: 'logout' }, 404);
    }
    userPrivate.refreshTokenHash = undefined;
    await userPrivate.save();

    return { success: true };
  }
}