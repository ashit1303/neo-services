import { Kafka, Producer, logLevel } from 'kafkajs';
import { Config } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';

export class KafkaProducer {
  private producer: Producer | null = null;
  private isConnected = false;
  private secretManager: SecretManager;
  private topicId: string;
  private username: string | null = null;
  private topic: string | null = null;
  private password: string | null = null;
  private brokers: any = null;

  constructor(config: Config, topicId: string) {
    this.secretManager = new SecretManager(config);
    this.topicId = topicId;
  }

  private async initProducer(): Promise<void> {
    const secrets = await this.secretManager.get('KAFKA_CONFIG').then((res) => JSON.parse(res));
    this.username = secrets['USERNAME'];
    this.password = secrets['PASSWORD'];
    this.topic = secrets[this.topicId];
    this.brokers = secrets['BROKER'];

    if (!this.topic || !this.username || !this.password || !this.brokers) {
      throw new Error('Failed to fetch Kafka credentials');
    }

    const kafka = new Kafka({
      clientId: 'producer-client',
      brokers: JSON.parse(this.brokers),
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-512',
        username: this.username,
        password: this.password,
      },
      logLevel: logLevel.INFO,
    });

    this.producer = kafka.producer();
  }

  public async connect(): Promise<void> {
    if (!this.producer) {
      await this.initProducer();
    }

    if (!this.producer) {
      throw new Error('Failed to initialize Kafka producer');
    }

    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
    }
  }

  public async send(data: any): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
        this.isConnected = true;
      }

      if (!this.producer) {
        throw new Error('Failed to initialize Kafka producer');
      }

      if (!this.topic) {
        throw new Error('Failed to fetch Kafka topic');
      }

      await this.producer.send({
        topic: this.topic,
        messages: [
          {
            value: typeof data === 'string' ? data : JSON.stringify(data),
          },
        ],
      });

      console.info(`Message sent to topic "${this.topic}"`);
    } catch (error) {
      console.error('Error sending Kafka message:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.producer && this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }
}
