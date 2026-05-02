import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { SecretManager } from '../core/core-clients/secret-manager.client';
import { Config } from '../interface/common.interface';

export class ChecksumVerifyMiddleware {
  private secretManager: SecretManager;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  private async generateChecksum(data: string): Promise<string> {
    const secret = await this.secretManager.get('JWT_SECRET');
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  public async verifyChecksum(req: Request, _res: Response, next: NextFunction) {

    const raw = req.headers['x-checksum'];

    if (!raw) {
      throw new Error('CHECKSUM_MISSING: Checksum header is missing');
    }

    const receivedChecksum = Array.isArray(raw) ? raw[0] : raw;

    const payloadString = JSON.stringify({
      query: req.body.query,
      variables: req.body.variables,
    });

    const expectedChecksum = await this.generateChecksum(payloadString);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedChecksum, 'hex'),
      Buffer.from(expectedChecksum, 'hex'),
    );
    if (!isValid) {
      throw new Error('CHECKSUM_INVALID: Checksum verification failed');
    }
    next();
  }

}