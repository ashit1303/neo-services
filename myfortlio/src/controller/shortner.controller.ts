import { Request, Response } from 'express';
import { generateShortCode } from '../core/core-utils';
import { ShortenerService } from '../services/shortener.service';
import { fmtRes } from '../core/core-utils/res-util';
import { fmtPrntErr } from '../core/core-utils/err-util';
import { SHORTNER_MSGS } from '../constants';

class ShortnerController {
  shortenerService: ShortenerService;

  constructor() {
    this.shortenerService = new ShortenerService();
  }

  async redirectToUrl(req: Request, res: Response) {
    try {
      const { shortValue } = req.params;
      const url = await this.shortenerService.fetchUrl(shortValue);
      return res.redirect(url);
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: SHORTNER_MSGS.ERR.FAILED_TO_REDIRECT_TO_SHORT_URL, apiName: 'redirectToUrl' });
    }
  }

  async isAvailable(req: Request, res: Response) {
    try {
      const { shortCode } = req.query as { shortCode: string };
      const data = await this.shortenerService.checkIfAvailable(shortCode);
      return fmtRes(res, { isAvailable: data });
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: SHORTNER_MSGS.ERR.FAILED_TO_CHECK_SHORT_URL_AVAILABILITY, apiName: 'isAvailable' });
    }
  }

  async createShortUrl(req: Request, res: Response) {
    try {
      const { shortCode, originalUrl } = req.query as { shortCode: string; originalUrl: string; };
      const data = await this.shortenerService.createShortUrl(shortCode, originalUrl);
      return fmtRes(res, { added: data });
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: SHORTNER_MSGS.ERR.FAILED_TO_CREATE_SHORT_URL, apiName: 'createShortUrl' });
    }
  }

  async createShortUrlByGuest(req: Request, res: Response) {
    try {
      const { originalUrl } = req.query as { originalUrl: string };
      const shortCode = generateShortCode();
      const data = await this.shortenerService.createShortUrl(shortCode.shortCode, originalUrl);
      return fmtRes(res, { added: data, shortCode: shortCode });
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: SHORTNER_MSGS.ERR.FAILED_TO_CREATE_SHORT_URL_BY_GUEST, apiName: 'createShortUrlByGuest' });
    }
  }

}

export default ShortnerController;