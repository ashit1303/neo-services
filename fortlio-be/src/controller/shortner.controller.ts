import { Request, Response } from 'express';
import { generateShortCode } from '../core/core-utils';
import { ShortenerService } from '../services/shortener.service';
import { fmtRes } from '../core/core-utils/res-util';
import { AppError } from '../core/core-utils/err-util';
import { SHORTNER_MSGS } from '../constants';
import { ShortItValidation, IsKeyAvailableValidation, ShortValueValidation } from '../validations/shorten-validation';

export class ShortnerController {

  constructor(private shortenerService: ShortenerService) { }

  redirectToUrl = async (req: Request, res: Response) => {
    try {
      const { shortValue } = ShortValueValidation.parse(req.params);
      const url = await this.shortenerService.fetchUrl(shortValue);
      if (!url) {
        throw new AppError('Short URL not found', { msg: 'Short URL not found', apiName: 'redirectToUrl', debugValues: { shortValue } }, 404);
      }
      return res.redirect(url);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: SHORTNER_MSGS.ERR.FAILED_TO_REDIRECT_TO_SHORT_URL, apiName: 'redirectToUrl' }, 400);
    }
  };

  isAvailable = async (req: Request, res: Response) => {
    try {
      const { alias } = IsKeyAvailableValidation.parse(req.query);
      const data = await this.shortenerService.checkIfAvailable(alias);
      return fmtRes(res, { isAvailable: !!data });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: SHORTNER_MSGS.ERR.FAILED_TO_CHECK_SHORT_URL_AVAILABILITY, apiName: 'isAvailable', error }, error.statusCode || 400);
    }
  };

  createShortUrl = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const { originalUrl, customAlias } = ShortItValidation.parse(body);
      const userId = req.headers.userId as string;

      let shortCode: string;
      if (customAlias) {
        shortCode = customAlias;
        const isAvailable = await this.shortenerService.checkIfAvailable(shortCode);
        if (!isAvailable) {
          throw new AppError('Custom alias is already taken', { msg: 'Custom alias is already taken', apiName: 'createShortUrl', debugValues: { customAlias } }, 400);
        }
      } else {
        let isAvailable = false;
        let generatedCode = '';
        while (!isAvailable) {
          const generated = generateShortCode();
          generatedCode = generated.shortCode;
          isAvailable = await this.shortenerService.checkIfAvailable(generatedCode);
        }
        shortCode = generatedCode;
      }

      const data = await this.shortenerService.createShortUrl(shortCode, originalUrl, userId);
      return fmtRes(res, { added: data, shortCode, originalUrl });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: SHORTNER_MSGS.ERR.FAILED_TO_CREATE_SHORT_URL, apiName: 'createShortUrl', error }, error.statusCode || 400);
    }
  };

  createShortUrlByGuest = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const { originalUrl, customAlias } = ShortItValidation.parse(body);

      let shortCode: string;
      if (customAlias) {
        shortCode = customAlias;
        const isAvailable = await this.shortenerService.checkIfAvailable(shortCode);
        if (!isAvailable) {
          throw new AppError('Custom alias is already taken', { msg: 'Custom alias is already taken', apiName: 'createShortUrlByGuest', debugValues: { customAlias } }, 400);
        }
      } else {
        let isAvailable = false;
        let generatedCode = '';
        while (!isAvailable) {
          const generated = generateShortCode();
          generatedCode = generated.shortCode;
          isAvailable = await this.shortenerService.checkIfAvailable(generatedCode);
        }
        shortCode = generatedCode;
      }

      const data = await this.shortenerService.createShortUrl(shortCode, originalUrl, null);
      return fmtRes(res, { added: data, shortCode, originalUrl });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: SHORTNER_MSGS.ERR.FAILED_TO_CREATE_SHORT_URL_BY_GUEST, apiName: 'createShortUrlByGuest', error }, error.statusCode || 400);
    }
  };

}
