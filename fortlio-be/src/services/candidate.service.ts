import mongoose from 'mongoose';
import CandidateProfile from '../models/candidate.model';
import CandidateBlog from '../models/candidate-blog.model';
import User from '../models/user.model';
import { ICandidateCreate, ICandidateBlogCreate } from '../interface/candidate-interface';
import { IFilter } from '../interface/common.interface';
import { AppError } from '../core/core-utils/err-util';
import { sensiSearch } from '../clients';
import { TYPSENSE_COLLECTION_NAME } from '../core/core-constants/common.constants';
import { getDataByFilter } from '../core/core-helper';
import { CANDIDATE_MSGS } from '../constants';

export class CandidateService {
  async upsertProfile(userId: string, data: ICandidateCreate) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      // Update basic details in User collection
      await User.findByIdAndUpdate(userObjectId, {
        fullName: data.fullName,
        email: data.email,
      });

      // Update dedicated details in Candidate Profile collection
      const profile = await CandidateProfile.findOneAndUpdate(
        { userId: userObjectId },
        {
          userId: userObjectId,
          mobileNumber: data.mobileNumber || '',
          skills: data.skills || [],
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          resumeUrl: data.resumeUrl || '',
          experience: data.experience ?? 0,
          bio: data.bio || '',
        },
        { new: true, upsert: true },
      );

      // Sync to Typesense immediately
      await this.syncCandidateToTypesense(profile);

      return profile;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_UPSERT_PROFILE, apiName: 'upsertProfile', debugValues: { userId } });
    }
  }

  async getProfileByUserId(userId: string) {
    try {
      return await CandidateProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate('userId').exec();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_FETCH_PROFILE, apiName: 'getProfileByUserId', debugValues: { userId } });
    }
  }

  async getProfileById(profileId: string) {
    try {
      return await CandidateProfile.findById(profileId).populate('userId').exec();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_FETCH_PROFILE, apiName: 'getProfileById', debugValues: { profileId } });
    }
  }

  async createBlog(userId: string, data: ICandidateBlogCreate) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const blog = new CandidateBlog({
        candidateId: userObjectId,
        title: data.title,
        content: data.content,
        blogKeywords: data.blogKeywords || [],
        status: data.status || 'published',
      });
      await blog.save();
      return blog;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_CREATE_BLOG, apiName: 'createBlog', debugValues: { userId } });
    }
  }

  async listBlogs(filterQuery: IFilter, filterUserId?: string) {
    try {
      const basePipeline: mongoose.PipelineStage[] = [];
      if (filterUserId) {
        basePipeline.push({ $match: { candidateId: new mongoose.Types.ObjectId(filterUserId) } });
      }
      const searchFields = ['title', 'content', 'blogKeywords'];
      return await getDataByFilter(filterQuery, basePipeline, searchFields, CandidateBlog);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CANDIDATE_MSGS.ERR.FAILED_TO_LIST_BLOGS, apiName: 'listBlogs' });
    }
  }

  async syncCandidateToTypesense(profile: any) {
    try {
      const user = await User.findById(profile.userId).lean();
      const blogs = await CandidateBlog.find({ candidateId: profile.userId, status: 'published' }).lean();
      const blogKeywords = blogs.map(b => `${b.title} ${b.blogKeywords.join(' ')} ${b.content}`).join(' ');

      const document = {
        id: profile._id.toString(),
        userId: profile.userId.toString(),
        fullName: user?.fullName || '',
        email: user?.email || '',
        mobileNumber: profile.mobileNumber || '',
        skills: profile.skills || [],
        experience: Number(profile.experience || 0),
        bio: profile.bio || '',
        blogKeywords,
      };
      await sensiSearch.importCollection([document], TYPSENSE_COLLECTION_NAME.CANDIDATES);
    } catch (error: any) {
      console.error('Failed to sync candidate to Typesense:', error.message || error);
      // Don't throw to avoid blocking the DB transaction, let background worker sync it eventually.
    }
  }
}
