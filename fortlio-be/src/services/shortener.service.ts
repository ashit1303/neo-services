import { AppError } from '../core/core-utils/err-util';
import ShortendLink from '../models/shortend-link.model';

export class ShortenerService {

  async fetchUrl(shortValue: string): Promise<string> {
    try {
      const resp = await ShortendLink.findOneAndUpdate(
        { shortCode: shortValue },
        { $inc: { accessCount: 1 } },
        { new: true },
      );
      return resp?.originalUrl || '';
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Error fetching short URL:', apiName: 'fetchUrl' });
    }
  }
  async checkIfAvailable(shortValue: string): Promise<boolean> {
    try {
      const resp = await ShortendLink.findOne({ shortCode: shortValue });
      return !Boolean(resp);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Error checking short URL availability:', apiName: 'checkIfAvailable' });
    }
  }
  async createShortUrl(shortValue: string, originalUrl: string, createdBy: string | null): Promise<boolean> {
    try {
      await ShortendLink.create({ originalUrl: originalUrl, shortCode: shortValue, createdBy });
      return true;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Error creating short URL:', apiName: 'createShortUrl' });
    }
  }
}
