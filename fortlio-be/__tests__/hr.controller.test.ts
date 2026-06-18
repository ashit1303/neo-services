import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { AppError } from '../src/core/core-utils/err-util';
import { HrController } from '../src/controller/hr.controller';
import { Request, Response } from 'express';
import ProfileViewHistory from '../src/models/profile-view.model';
import SearchHistory from '../src/models/search-history.model';
import User from '../src/models/user.model';
import { sensiSearch } from '../src/clients';

describe('HrController Unit Tests', () => {
  let hrController: HrController;
  let mockHistoryService: any;
  let mockHrService: any;
  let mockUserService: any;
  let mockAuthnService: any;
  let mockRes: any;

  const mockResponse = () => {
    const res: any = {};
    res.status = mock((code: number) => {
      res.statusCode = code;
      return res;
    });
    res.send = mock((body: any) => {
      res.body = body;
      return res;
    });
    res.json = mock((body: any) => {
      res.body = body;
      return res;
    });
    return res as unknown as Response;
  };

  const VALID_USER_ID = '123456789012345678901234';
  const VALID_HR_ID = '678901234567890123456789';
  const VALID_EMAIL = 'hr@example.com';
  const VALID_PHONE = '123456789012';

  beforeEach(() => {
    mockHrService = {
      upsertProfile: mock(() => Promise.resolve({
        _id: VALID_HR_ID,
        userId: VALID_USER_ID,
        fullName: 'Test HR',
        email: VALID_EMAIL,
        mobileNumber: VALID_PHONE,
        companyName: 'Test Corp',
        companyWebsite: 'https://testcorp.com',
        designation: 'Recruiter',
        toObject: () => ({
          _id: VALID_HR_ID,
          userId: VALID_USER_ID,
          fullName: 'Test HR',
          email: VALID_EMAIL,
          mobileNumber: VALID_PHONE,
          companyName: 'Test Corp',
          companyWebsite: 'https://testcorp.com',
          designation: 'Recruiter',
        }),
      })),
      getProfileByUserId: mock(() => Promise.resolve({
        _id: VALID_HR_ID,
        userId: {
          _id: VALID_USER_ID,
          fullName: 'Test HR',
          email: VALID_EMAIL,
        },
        mobileNumber: VALID_PHONE,
        companyName: 'Test Corp',
        companyWebsite: 'https://testcorp.com',
        designation: 'Recruiter',
        toObject: () => ({
          _id: VALID_HR_ID,
          userId: {
            _id: VALID_USER_ID,
            fullName: 'Test HR',
            email: VALID_EMAIL,
          },
          mobileNumber: VALID_PHONE,
          companyName: 'Test Corp',
          companyWebsite: 'https://testcorp.com',
          designation: 'Recruiter',
        }),
      })),
    };

    mockHistoryService = {
      getViewedProfiles: mock(() => Promise.resolve([])),
      getSearches: mock(() => Promise.resolve([])),
    };

    mockUserService = {
      addCoins: mock(() => Promise.resolve({ _id: VALID_USER_ID, coins: 100 })),
      deductCoins: mock(() => Promise.resolve({ _id: VALID_USER_ID, coins: 95 })),
    };

    mockAuthnService = {
      verifyToken: mock(() => Promise.resolve({
        userId: VALID_USER_ID,
        name: 'Requester Name',
        email: 'requester@example.com',
        role: 'HR',
      })),
    };

    hrController = new HrController(
      mockHrService,
      mockHistoryService,
      mockUserService,
      mockAuthnService,
    );
    mockRes = mockResponse();

    ProfileViewHistory.findOneAndUpdate = mock(() => Promise.resolve({})) as any;
    SearchHistory.findOneAndUpdate = mock(() => Promise.resolve({})) as any;

    User.findById = mock(() => ({
      populate: mock(() => ({
        lean: mock(() => Promise.resolve(null)),
      })),
    }) as any);

    (sensiSearch.search as any) = mock(() => Promise.resolve({
      hits: [
        {
          document: {
            id: 'candidate123',
            userId: 'different-user-id',
            fullName: 'Test Candidate',
            email: 'candidate@example.com',
            mobileNumber: '9876543210',
            skills: ['TypeScript'],
            experience: 3,
            bio: 'Typesense result bio',
          },
        },
      ],
    }) as any);
  });

  describe('upsertProfile', () => {
    it('should successfully upsert HR profile with valid parameters', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: {
          fullName: 'Test HR',
          email: VALID_EMAIL,
          mobileNumber: VALID_PHONE,
          companyName: 'Test Corp',
          companyWebsite: 'https://testcorp.com',
          designation: 'Recruiter',
        },
      } as unknown as Request;

      await hrController.upsertProfile(req, mockRes);

      expect(mockHrService.upsertProfile).toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.success).toBe(true);
      expect(mockRes.body.data.fullName).toBe('Test HR');
    });

    it('should fail validation when email is invalid', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: {
          fullName: 'Test HR',
          email: 'invalid-email',
        },
      } as unknown as Request;

      expect(hrController.upsertProfile(req, mockRes)).rejects.toThrow(AppError);
    });
  });

  describe('getProfile', () => {
    it('should return complete details for the HR user', async () => {
      const req = {
        params: { userId: VALID_USER_ID },
        headers: { authorization: 'Bearer valid-token', userId: 'some-other-id' },
      } as unknown as Request;

      await hrController.getProfile(req, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.data.email).toBe(VALID_EMAIL);
      expect(mockRes.body.data.companyName).toBe('Test Corp');
    });
  });

  describe('getViewedProfiles', () => {
    it('should successfully retrieve viewed profiles history', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
      } as unknown as Request;

      await hrController.getViewedProfiles(req, mockRes);

      expect(mockHistoryService.getViewedProfiles).toHaveBeenCalledWith(VALID_USER_ID);
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.success).toBe(true);
      expect(Array.isArray(mockRes.body.data)).toBe(true);
    });
  });

  describe('getSearches', () => {
    it('should successfully retrieve searches history', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
      } as unknown as Request;

      await hrController.getSearches(req, mockRes);

      expect(mockHistoryService.getSearches).toHaveBeenCalledWith(VALID_USER_ID);
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.success).toBe(true);
      expect(Array.isArray(mockRes.body.data)).toBe(true);
    });
  });

  describe('searchCandidates', () => {
    it('should deduct coins and return masked candidate search results for candidate viewer', async () => {
      const req = {
        headers: { userId: VALID_USER_ID, authorization: 'Bearer token' },
        query: { searchKey: 'TypeScript', minExperience: '2', skills: 'TypeScript' },
      } as unknown as Request;

      await hrController.searchCandidates(req, mockRes);

      expect(mockUserService.deductCoins).toHaveBeenCalledWith(VALID_USER_ID, 5);
      expect(sensiSearch.search).toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.data.remainingCoins).toBe(95);

      // Email and mobile must be masked because search requester is not HR/Admin and not the candidate itself
      expect(mockRes.body.data.candidates[0].email).toContain('***');
      expect(mockRes.body.data.candidates[0].mobileNumber).toContain('***');
    });
  });
});
