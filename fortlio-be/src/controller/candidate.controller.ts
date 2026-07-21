import { Request, Response } from 'express';
import { CandidateService } from '../services/candidate.service';
import { AuthnService } from '../services/authn.services';
import { UserService } from '../services/user.service';
import { CandidateProfileUpsertValidation, CandidateBlogCreateValidation, mdToPdfValidation } from '../validations/candidate-validation';
import { FilterQueryValidation } from '../validations/common-validation';
import { fmtRes } from '../core/core-utils/res-util';
import { AppError } from '../core/core-utils/err-util';
import User from '../models/user.model';
import { CANDIDATE_MSGS } from '../constants';
import { convertMdToPdf } from '../core/core-utils/md-to-pdf';

export class CandidateController {
  constructor(
    private candidateService: CandidateService,
    private authnService: AuthnService,
    private userService: UserService,
  ) { }

  private maskEmail(email: string): string {
    if (!email) {
      return '';
    }
    const [local, domain] = email.split('@');
    if (!domain) {
      return '***';
    }
    if (local.length <= 2) {
      return `${local[0] || ''}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (!phone) {
      return '';
    }
    if (phone.length <= 4) {
      return '****';
    }
    const visibleCount = 2;
    const maskedLength = phone.length - (visibleCount * 2);
    const firstPart = phone.slice(0, visibleCount);
    const lastPart = phone.slice(-visibleCount);
    return `${firstPart}${'*'.repeat(maskedLength > 0 ? maskedLength : 4)}${lastPart}`;
  }

  private async getRequesterInfo(req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return null;
      }
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      const userDetails = await this.authnService.verifyToken(token);
      if (!userDetails || !userDetails.userId) {
        return null;
      }

      const user = await User.findById(userDetails.userId).populate('roleId').lean();
      if (!user) {
        return { userId: userDetails.userId, isHRorAdmin: false };
      }

      const roleName = (user.roleId as any)?.roleName;
      const isHRorAdmin = roleName === 'HR' || roleName === 'Admin';
      return { userId: userDetails.userId.toString(), isHRorAdmin };
    } catch {
      return null;
    }
  }

  private async shouldShowComplete(req: Request, candidateUserId: string): Promise<boolean> {
    const requester = await this.getRequesterInfo(req);
    if (!requester) {
      return false;
    }
    if (requester.isHRorAdmin) {
      return true;
    }
    return requester.userId === candidateUserId.toString();
  }

  upsertProfile = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CANDIDATE_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'upsertProfile' }, 401);
      }

      const body = req.body;
      CandidateProfileUpsertValidation.parse(body);

      const profile = await this.candidateService.upsertProfile(loggedInUserId, body);
      return fmtRes(res, profile);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_UPSERT_PROFILE, apiName: 'upsertProfile' }, 400);
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw new AppError(CANDIDATE_MSGS.ERR.USER_ID_REQUIRED, { apiName: 'getProfile' }, 400);
      }

      const profile = await this.candidateService.getProfileByUserId(userId);
      if (!profile) {
        throw new AppError(CANDIDATE_MSGS.ERR.PROFILE_NOT_FOUND, { apiName: 'getProfile', debugValues: { userId } }, 404);
      }

      const showComplete = await this.shouldShowComplete(req, userId);
      const profileObj: any = profile.toObject();

      // Map basic user details back to root of profileObj
      const userObj = profileObj.userId;
      profileObj.fullName = (typeof userObj === 'object' && userObj !== null) ? (userObj.fullName || '') : (profileObj.fullName || '');
      profileObj.email = (typeof userObj === 'object' && userObj !== null) ? (userObj.email || '') : (profileObj.email || '');

      if (typeof profileObj.userId === 'object' && profileObj.userId !== null) {
        profileObj.userId = profileObj.userId._id.toString();
      }

      if (!showComplete) {
        profileObj.email = this.maskEmail(profileObj.email);
        profileObj.mobileNumber = this.maskPhone(profileObj.mobileNumber);
      }

      // Record profile view to view history if viewer is logged in and not viewing themselves
      const loggedInUserId = req.headers.userId as string;
      if (loggedInUserId && loggedInUserId !== userId) {
        const ProfileViewHistory = require('../models/profile-view.model').default;
        await ProfileViewHistory.findOneAndUpdate(
          { userId: loggedInUserId, viewedUserId: userId },
          { viewedAt: new Date() },
          { upsert: true },
        ).catch((err: any) => console.error('Failed to log view profile history:', err));
      }

      return fmtRes(res, profileObj);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_FETCH_PROFILE, apiName: 'getProfile' }, error.statusCode || 400);
    }
  };

  createBlog = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CANDIDATE_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'createBlog' }, 401);
      }

      const body = req.body;
      CandidateBlogCreateValidation.parse(body);

      const blog = await this.candidateService.createBlog(loggedInUserId, body);
      return fmtRes(res, blog);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_CREATE_BLOG, apiName: 'createBlog' }, 400);
    }
  };

  listBlogs = async (req: Request, res: Response) => {
    try {
      const { page, pageSize, userId } = req.query as any;
      FilterQueryValidation.parse({ page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined });

      const result = await this.candidateService.listBlogs({ page, pageSize }, userId);
      return fmtRes(res, result);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_LIST_BLOGS, apiName: 'listBlogs' }, 400);
    }
  };

  convertMdToPdf = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      mdToPdfValidation.parse(body);

      const { content, settings, s3Options } = body;
      const { pdfBuffer, s3Url } = await convertMdToPdf(content, settings, s3Options);

      if (s3Options?.storeInS3 && s3Url) {
        return fmtRes(res, { url: s3Url });
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
        return res.send(pdfBuffer);
      }
    } catch (error: any) {
      throw new AppError(
        error.message || 'Failed to generate PDF',
        { msg: 'Failed to convert markdown to PDF', apiName: 'convertMdToPdf', error },
        error.statusCode || 400,
      );
    }
  };
}

