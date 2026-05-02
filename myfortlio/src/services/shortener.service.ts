import ShortendLink from '../models/shortend-link.model';

export class ShortenerService {

  async fetchUrl(shortValue: string): Promise<string> {
    const resp = await ShortendLink.findOne({ shortCode: shortValue });
    return resp?.originalUrl || '';
  }
  async checkIfAvailable(shortValue: string): Promise<Boolean> {
    try {
      const resp = await ShortendLink.findOne({ shortCode: shortValue });
      return !Boolean(resp);
    } catch (error) {
      console.error('Error checking short URL availability:', error);
      return false;
    }
  }
  async createShortUrl(shortValue: string, originalUrl: string): Promise<boolean> {
    try {
      await ShortendLink.create({ originalUrl: originalUrl, shortCode: shortValue });
      return true;
    } catch (error) {
      console.error('Error creating short URL:', error);
      return false;
    }

  }
}
