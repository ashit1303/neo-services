import { Config } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';
import { AppError } from '../core-utils/err-util';
import { post } from '../core-utils/fetch.util';

export class ZincLogger {
  private secretManager: SecretManager;

  private zincUrl!: string;
  private zincIndex!: string;
  private zincUsername!: string;
  private zincPassword!: string;

  private createdIndex = false;
  private initialized = false;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  private async initClient(): Promise<void> {
    const secrets = await this.secretManager.get('ZINC_CONFIG').then((res) => JSON.parse(res));

    this.zincUrl = secrets.ZINC_URL;
    this.zincIndex = secrets.ZINC_INDEX;
    this.zincUsername = secrets.ZINC_USERNAME;
    this.zincPassword = secrets.ZINC_PASSWORD;

    if (!this.zincUrl || !this.zincIndex) {
      throw new AppError('Failed to fetch Zinc configuration');
    }

    this.initialized = true;
  }

  private async ensureInit() {
    if (!this.initialized) {
      await this.initClient();
    }
  }

  // create index (fixed axios bug)
  async createIndex() {
    await this.ensureInit();

    const auth = {
      username: this.zincUsername,
      password: this.zincPassword,
    };

    await post(
      `${this.zincUrl}/api/index/error`,
      {
        name: 'error',
        storage_type: 'disk',
        settings: {},
        mappings: {},
      },
      // Authorization: Basic base64("userId:password") 
      { headers: { 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}` } },
    );

    await post(
      `${this.zincUrl}/api/index/logs`,
      {
        name: 'logs',
        storage_type: 'disk',
        settings: {},
        mappings: {},
      },
      { headers: { 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}` } },
    );

    this.createdIndex = true;
  }

  async sendLog(
    level: string,
    message: string,
    context?: string | object,
    trace?: string | object,
  ) {
    await this.ensureInit();

    const logEntry = {
      level,
      message,
      ...((typeof context === 'object' && context) || (context ? { context } : {})),
      ...(trace ? { trace } : {}),
      timestamp: new Date().toISOString(),
    };

    try {
      // non-blocking fire-and-forget
      post(`${this.zincUrl}/api/${this.zincIndex}/_doc`, logEntry,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${this.zincUsername}:${this.zincPassword}`).toString('base64')}`,
          },
        },
      );
    } catch (error: any) {
      if (!this.createdIndex) {
        this.createIndex().catch();
      }
      console.error('Error sending log to ZincSearch:', error?.message);
    }
  }

  log(message: string, context?: string | object) {
    this.sendLog('info', message, context);
  }

  error(message: string, trace?: string, context?: string | object) {
    this.sendLog('error', message, context, trace);
  }

  warn(message: string, context?: string | object) {
    this.sendLog('warn', message, context);
  }

  debug(message: string, context?: string | object) {
    this.sendLog('debug', message, context);
  }

  verbose(message: string, context?: string | object) {
    this.sendLog('verbose', message, context);
  }
}