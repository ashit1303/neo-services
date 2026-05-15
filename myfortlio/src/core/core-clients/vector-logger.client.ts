import * as net from 'net';
import { SecretManager } from './secret-manager.client';
import { Config } from '../../interface/common.interface';
export class VectorLogger {
  private secretManager: SecretManager;

  private vectorHost!: string;
  private vectorPort!: number;

  private client!: net.Socket;
  private isConnected = false;
  private initialized = false;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  // ---------------- INIT ----------------

  private async initClient(): Promise<void> {
    const secrets = await this.secretManager
      .get('VECTOR_CONFIG')
      .then((res) => JSON.parse(res));

    this.vectorHost = secrets.HOST;
    this.vectorPort = Number(secrets.PORT);

    if (!this.vectorHost || !this.vectorPort) {
      throw new Error('Failed to fetch Vector configuration');
    }

    this.client = new net.Socket();
    this.setupConnection();

    this.initialized = true;
  }

  private async ensureInit() {
    if (!this.initialized) {
      await this.initClient();
    }
  }

  // ---------------- CONNECTION ----------------

  private setupConnection() {
    this.client.connect(this.vectorPort, this.vectorHost, () => {
      this.isConnected = true;
      console.info(`✅ Connected to Vector at ${this.vectorHost}:${this.vectorPort}`);
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      console.error('Vector logging error:', err.message);
      this.retryConnection();
    });

    this.client.on('close', () => {
      this.isConnected = false;
      console.warn('Vector connection closed. Reconnecting...');
      this.retryConnection();
    });
  }

  private retryConnection() {
    setTimeout(() => {
      try {
        this.client.destroy(); // clean old socket
        this.client = new net.Socket();
        this.setupConnection();
      } catch (err) {
        console.error('Reconnect failed:', err);
      }
    }, 5000);
  }

  // ---------------- LOGGING ----------------

  private async sendLog(
    level: string,
    message: string,
    context?: string | object,
    trace?: string,
  ) {
    await this.ensureInit();

    if (!this.isConnected) {
      console.warn('VectorLogger: Not connected. Log skipped.');
      return;
    }

    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...((typeof context === 'object' && context) || (context ? { context } : {})),
      ...(trace ? { trace } : {}),
    };

    try {
      const logString = JSON.stringify(logEntry) + '\n';
      this.client.write(logString);
    } catch (err) {
      console.error('Error writing log:', err);
    }
  }

  // ---------------- PUBLIC API ----------------

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