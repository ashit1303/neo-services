import { SESClient } from '@aws-sdk/client-ses';
// import { StatusCodes } from 'http-status-codes';
// import { ERR_MSGS } from '../../constants/messages';
import { Config } from '../../interface';
import { SecretManager } from './secret-manager.client';
// import { formatErrorMessage } from '../../utils/error-util';

export class SESClientUtil {
  private static sesClient: SESClient | null = null;
  private static initializing: Promise<SESClient> | null = null;

  private secretManager: SecretManager;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  async getSESClient(): Promise<SESClient> {
    // Already initialized
    if (SESClientUtil.sesClient) {
      return SESClientUtil.sesClient;
    }

    // Initialization in progress (handles concurrent calls)
    if (SESClientUtil.initializing) {
      return SESClientUtil.initializing;
    }

    // First call initializes
    SESClientUtil.initializing = (async () => {
      const accessKeyId = await this.secretManager.get('AWS_ACCESS_KEY_ID');
      const secretAccessKey = await this.secretManager.get('AWS_SECRET_ACCESS_KEY');

      SESClientUtil.sesClient = new SESClient({
        credentials: { accessKeyId, secretAccessKey },
        region: process.env.AWS_REGION,
      });

      return SESClientUtil.sesClient;
    })();

    return SESClientUtil.initializing;
  }
}
