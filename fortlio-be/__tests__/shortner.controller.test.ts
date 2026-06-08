import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { AppError } from '../src/core/core-utils/err-util';
import { ShortnerController } from '../src/controller/shortner.controller';
import { Request, Response } from 'express';

describe('ShortnerController Unit Tests', () => {
  let shortnerController: ShortnerController;
  let mockShortenerService: any;
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
    res.redirect = mock((url: string) => {
      res.redirectUrl = url;
      return res;
    });
    return res as unknown as Response;
  };

  const VALID_USER_ID = '123456789012345678901234';
  const ORIGINAL_URL = 'https://example.com/candidate/profile/123456789012345678901234';

  beforeEach(() => {
    mockShortenerService = {
      fetchUrl: mock(() => Promise.resolve(ORIGINAL_URL)),
      checkIfAvailable: mock(() => Promise.resolve(true)),
      createShortUrl: mock(() => Promise.resolve(true)),
    };

    shortnerController = new ShortnerController(mockShortenerService);
    mockRes = mockResponse();
  });

  describe('redirectToUrl', () => {
    it('should successfully redirect to the original URL if code exists', async () => {
      const req = {
        params: { shortValue: 'abc-def-ghi' },
      } as unknown as Request;

      await shortnerController.redirectToUrl(req, mockRes);

      expect(mockShortenerService.fetchUrl).toHaveBeenCalledWith('abc-def-ghi');
      expect(mockRes.redirectUrl).toBe(ORIGINAL_URL);
    });

    it('should throw AppError with 404 if the short code is not found', async () => {
      mockShortenerService.fetchUrl.mockResolvedValue('');

      const req = {
        params: { shortValue: 'non-existent' },
      } as unknown as Request;

      expect(shortnerController.redirectToUrl(req, mockRes)).rejects.toThrow(AppError);
    });
  });

  describe('isAvailable', () => {
    it('should return isAvailable: true if custom alias is free', async () => {
      const req = {
        query: { alias: 'my-alias' },
      } as unknown as Request;

      await shortnerController.isAvailable(req, mockRes);

      expect(mockShortenerService.checkIfAvailable).toHaveBeenCalledWith('my-alias');
      expect(mockRes.body.success).toBe(true);
      expect(mockRes.body.data.isAvailable).toBe(true);
    });
  });

  describe('createShortUrl', () => {
    it('should successfully create short URL with custom alias if available', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: { originalUrl: ORIGINAL_URL, customAlias: 'my-alias' },
      } as unknown as Request;

      await shortnerController.createShortUrl(req, mockRes);

      expect(mockShortenerService.checkIfAvailable).toHaveBeenCalledWith('my-alias');
      expect(mockShortenerService.createShortUrl).toHaveBeenCalledWith('my-alias', ORIGINAL_URL, VALID_USER_ID);
      expect(mockRes.body.success).toBe(true);
      expect(mockRes.body.data.shortCode).toBe('my-alias');
    });

    it('should throw error if custom alias is already taken', async () => {
      mockShortenerService.checkIfAvailable.mockResolvedValue(false);

      const req = {
        headers: { userId: VALID_USER_ID },
        body: { originalUrl: ORIGINAL_URL, customAlias: 'taken-alias' },
      } as unknown as Request;

      expect(shortnerController.createShortUrl(req, mockRes)).rejects.toThrow(AppError);
    });

    it('should generate a unique random short code if custom alias is not provided', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: { originalUrl: ORIGINAL_URL },
      } as unknown as Request;

      await shortnerController.createShortUrl(req, mockRes);

      expect(mockShortenerService.createShortUrl).toHaveBeenCalled();
      expect(mockRes.body.success).toBe(true);
      expect(mockRes.body.data.shortCode).toBeDefined();
    });
  });

  describe('createShortUrlByGuest', () => {
    it('should successfully create short URL for guest with null createdBy', async () => {
      const req = {
        body: { originalUrl: ORIGINAL_URL },
      } as unknown as Request;

      await shortnerController.createShortUrlByGuest(req, mockRes);

      expect(mockShortenerService.createShortUrl).toHaveBeenCalledWith(expect.any(String), ORIGINAL_URL, null);
      expect(mockRes.body.success).toBe(true);
    });
  });
});
