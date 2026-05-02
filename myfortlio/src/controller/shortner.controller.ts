import { Request, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import { ERR_MSGS } from '../constants/error-messages';
// import { AnalyticsFilterValidation } from '../validation/analytics-validation';
// import { IAlertFilter } from '../interface/alert.interface';
import { generateShortCode } from '../core/core-utils';
import { ShortenerService } from '../services/shortener.service';

class ShortnerController {
  shortenerService: ShortenerService;

  constructor() {
    this.shortenerService = new ShortenerService();
  }

  async redirectToUrl(req: Request, res: Response) {
    try {
      const { shortValue } = req.params;

      const data = await this.shortenerService.fetchUrl(shortValue);

      return res.redirect(data);
    } catch (error: any) {
      return res.status(500).send({ message: error.message || 'FAILED_TO_REDIRECT' });
    }
  }

  async isAvailable(req: Request, res: Response) {
    try {
      const { shortCode } = req.query as { shortCode: string };

      const data = await this.shortenerService.checkIfAvailable(shortCode);

      return res.status(200).send({ isAvailable: data });
    } catch (error: any) {
      return res.status(500).send({
        message: error.message || 'FAILED_TO_CHECK_AVAILABILITY',
      });
    }
  }

  async createShortUrl(req: Request, res: Response) {
    try {
      const { shortCode, originalUrl } = req.query as {
        shortCode: string;
        originalUrl: string;
      };

      const data = await this.shortenerService.createShortUrl(
        shortCode,
        originalUrl,
      );

      return res.status(200).send({
        added: data,
      });
    } catch (error: any) {
      return res.status(500).send({
        message: error.message || 'FAILED_TO_CREATE_SHORT_URL',
      });
    }
  }

  async createShortUrlByGuest(req: Request, res: Response) {
    try {
      const { originalUrl } = req.query as { originalUrl: string };

      const shortCode = generateShortCode();

      const data = await this.shortenerService.createShortUrl(
        shortCode.shortCode,
        originalUrl,
      );

      return res.status(200).send({ added: data, shortCode: shortCode });
    } catch (error: any) {
      return res.status(500).send({ message: error.message || 'FAILED_TO_CREATE_SHORT_URL_GUEST' });
    }
  }

}

export default ShortnerController;