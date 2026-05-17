import { SESv2Client } from '@aws-sdk/client-sesv2';
import { SecretManager } from './secret-manager.client';
import { Config } from '../../interface/common.interface';

export class SESClientUtil {
  private static sesClient: SESv2Client | null = null;
  private static initializing: Promise<SESv2Client> | null = null;

  private secretManager: SecretManager;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  async getSESClient(): Promise<SESv2Client> {
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
      const awsConfig = await this.secretManager.get('AWS_CONFIG').then((res) => JSON.parse(res));
      const accessKeyId = awsConfig.AWS_ACCESS_KEY_ID;
      const secretAccessKey = awsConfig.AWS_SECRET_ACCESS_KEY;

      SESClientUtil.sesClient = new SESv2Client({
        credentials: { accessKeyId, secretAccessKey },
        region: process.env.AWS_REGION,
      });

      return SESClientUtil.sesClient;
    })();

    return SESClientUtil.initializing;
  }
}
