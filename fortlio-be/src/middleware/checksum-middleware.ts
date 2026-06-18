import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { SecretManager } from '../core/core-clients/secret-manager.client';
import { Config } from '../interface/common.interface';
import { AppError } from '../core/core-utils/err-util';

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
      throw new AppError('CHECKSUM_MISSING: Checksum header is missing');
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
      throw new AppError('CHECKSUM_INVALID: Checksum verification failed');
    }
    next();
  }

  public verifyGeneralChecksum = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const raw = req.headers['x-checksum'];
      if (!raw) {
        throw new AppError('CHECKSUM_MISSING: Checksum header is missing', { apiName: 'verifyGeneralChecksum' }, 400);
      }
      const receivedChecksum = Array.isArray(raw) ? raw[0] : raw;

      let payloadString = '';
      if (req.method === 'GET') {
        payloadString = JSON.stringify(req.query);
      } else {
        payloadString = JSON.stringify(req.body);
      }

      const expectedChecksum = await this.generateChecksum(payloadString);

      const receivedBuffer = Buffer.from(receivedChecksum, 'hex');
      const expectedBuffer = Buffer.from(expectedChecksum, 'hex');

      if (receivedBuffer.length !== expectedBuffer.length) {
        throw new AppError('CHECKSUM_INVALID: Checksum verification failed', { apiName: 'verifyGeneralChecksum' }, 400);
      }

      const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
      if (!isValid) {
        throw new AppError('CHECKSUM_INVALID: Checksum verification failed', { apiName: 'verifyGeneralChecksum' }, 400);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}