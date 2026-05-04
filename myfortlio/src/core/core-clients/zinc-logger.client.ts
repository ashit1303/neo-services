import axios from 'axios';
import { Config } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';

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
      throw new Error('Failed to fetch Zinc configuration');
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

    await axios.post(
      `${this.zincUrl}/api/index/error`,
      {
        name: 'error',
        storage_type: 'disk',
        settings: {},
        mappings: {},
      },
      { auth, headers: { 'Content-Type': 'application/json' } },
    );

    await axios.post(
      `${this.zincUrl}/api/index/logs`,
      {
        name: 'logs',
        storage_type: 'disk',
        settings: {},
        mappings: {},
      },
      { auth, headers: { 'Content-Type': 'application/json' } },
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
      axios.post(
        `${this.zincUrl}/api/${this.zincIndex}/_doc`,
        logEntry,
        {
          auth: {
            username: this.zincUsername,
            password: this.zincPassword,
          },
          headers: { 'Content-Type': 'application/json' },
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