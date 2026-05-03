import { fmtErr } from '../core/core-utils/err-util';
import ShortendLink from '../models/shortend-link.model';

export class ShortenerService {

  async fetchUrl(shortValue: string): Promise<string> {
    try {
      const resp = await ShortendLink.findOne({ shortCode: shortValue });
      return resp?.originalUrl || '';
    } catch (error) {
      throw fmtErr(error, { msg: 'Error fetching short URL:', apiName: 'fetchUrl' });
    }
  }
  async checkIfAvailable(shortValue: string): Promise<Boolean> {
    try {
      const resp = await ShortendLink.findOne({ shortCode: shortValue });
      return !Boolean(resp);
    } catch (error) {
      throw fmtErr(error, { msg: 'Error checking short URL availability:', apiName: 'checkIfAvailable' });
    }
  }
  async createShortUrl(shortValue: string, originalUrl: string): Promise<boolean> {
    try {
      await ShortendLink.create({ originalUrl: originalUrl, shortCode: shortValue });
      return true;
    } catch (error) {
      throw fmtErr(error, { msg: 'Error creating short URL:', apiName: 'createShortUrl' });

    }

  }
}
