import { S3Client } from '@aws-sdk/client-s3';
import { SecretManager } from './secret-manager.client';
import { Config } from '../../interface/common.interface';
export class S3ClientClass {
  private readonly credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  private secretManager: SecretManager;
  private static s3Client: S3Client | null = null;
  private readonly region: string;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
    this.region = config.awsRegion;
    this.credentials = {
      accessKeyId: '',
      secretAccessKey: '',
    };
  }

  private async initCredentials() {

    const awsConfig = await this.secretManager.get('AWS_CONFIG').then((res) => JSON.parse(res));
    this.credentials.accessKeyId = awsConfig.AWS_ACCESS_KEY_ID;
    this.credentials.secretAccessKey = awsConfig.AWS_SECRET_ACCESS_KEY;
  }

  public async getS3Client(): Promise<S3Client> {
    if (!S3ClientClass.s3Client) {
      await this.initCredentials();
      S3ClientClass.s3Client = new S3Client({
        credentials: this.credentials,
        region: this.region,
      });
    }
    return S3ClientClass.s3Client;
  }
}
