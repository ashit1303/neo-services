import mongoose from 'mongoose';
import ProfileViewHistory from '../models/profile-view.model';
import SearchHistory from '../models/search-history.model';
import CandidateProfile from '../models/candidate.model';
import { AppError } from '../core/core-utils/err-util';
import { HR_MSGS } from '../constants';

export class HistoryService {
  async getViewedProfiles(userId: string) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const historyItems = await ProfileViewHistory.find({ userId: userObjectId })
        .sort({ viewedAt: -1 })
        .limit(10)
        .lean()
        .exec();

      const results = [];
      for (const item of historyItems) {
        // Find profile details (either Candidate or HR profile, let's fetch candidate details first)
        const profile = await CandidateProfile.findOne({ userId: item.viewedUserId })
          .populate('userId', 'fullName email')
          .lean()
          .exec();

        if (profile) {
          const profileObj: any = { ...profile };
          const userObj = profileObj.userId;
          profileObj.fullName = userObj?.fullName || '';
          profileObj.email = userObj?.email || '';
          if (typeof profileObj.userId === 'object' && profileObj.userId !== null) {
            profileObj.userId = profileObj.userId._id.toString();
          }
          results.push({
            viewedUserId: item.viewedUserId.toString(),
            viewedAt: item.viewedAt,
            profile: profileObj,
          });
        } else {
          // If not candidate, check if it's an HR profile
          const HrProfile = require('../models/hr.model').default;
          const hrProfile = await HrProfile.findOne({ userId: item.viewedUserId }).populate('userId', 'fullName email').lean().exec();

          if (hrProfile) {
            const hrObj: any = { ...hrProfile };
            const userObj = hrObj.userId;
            hrObj.fullName = userObj?.fullName || '';
            hrObj.email = userObj?.email || '';
            if (typeof hrObj.userId === 'object' && hrObj.userId !== null) {
              hrObj.userId = hrObj.userId._id.toString();
            }
            results.push({
              viewedUserId: item.viewedUserId.toString(),
              viewedAt: item.viewedAt,
              profile: hrObj,
            });
          }
        }
      }

      return results;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: HR_MSGS.ERR.FAILED_TO_FETCH_VIEWED_PROFILES, apiName: 'getViewedProfiles' });
    }
  }

  async getSearches(userId: string) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      return await SearchHistory.find({ userId: userObjectId }).sort({ searchedAt: -1 }).limit(10).exec();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: HR_MSGS.ERR.FAILED_TO_FETCH_SEARCH_HISTORY, apiName: 'getSearches' });
    }
  }
}
