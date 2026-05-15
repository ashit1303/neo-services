import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Config } from '../../interface/common.interface';

export class SecretManager {
  private static cache: any = null;
  private static expiry = 0;
  private client: SecretsManagerClient;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = new SecretsManagerClient({ region: this.config.awsRegion });
  }

  private async fetchSecretAndCache() {
    if (SecretManager.cache && Date.now() < SecretManager.expiry) {
      return SecretManager.cache;
    }

    const response = await this.client.send(
      new GetSecretValueCommand({
        SecretId: this.config.awsSecretName,
        VersionStage: 'AWSCURRENT',
      }),
    );

    let secret: any;
    if (response.SecretString) {
      secret = JSON.parse(response.SecretString);
    } else if (response.SecretBinary) {
      secret = JSON.parse(response.SecretBinary.toString());
    } else {
      throw new Error('No secret data returned');
    }

    SecretManager.cache = secret;
    SecretManager.expiry = Date.now() + 30 * 60 * 1000; // cache 30 mins
    return secret;
  }
  async fetchAll() {
    return this.fetchSecretAndCache();
  }

  async get(key: string) {
    if (SecretManager.cache && key in SecretManager.cache) {
      return SecretManager.cache[key];
    }

    const secrets = await this.fetchSecretAndCache();
    if (!(key in secrets)) {
      throw new Error(`Secret key ${key} not found`);
    }
    return secrets[key];
  }
}
