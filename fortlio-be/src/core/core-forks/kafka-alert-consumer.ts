import { Kafka, EachBatchPayload, Consumer, logLevel } from 'kafkajs';
import { SecretManager } from '../core-clients/secret-manager.client';
import { KAKFA_TOPICS } from '../core-constants/common.constants';
import { Config } from '../../interface/common.interface';

type Pending = {
  messages: EachBatchPayload['batch']['messages'];
  topic: string;
  partition: number;
  resolveOffset: (offset: string) => void;
  commitOffsetsIfNecessary: () => Promise<void>;
};

interface KafkaSecrets {
  username: string;
  password: string;
  topic: string;
  brokers: string;
}

export class KafkaWorker {
  private secretManager: SecretManager;
  private consumer!: Consumer;

  private batchCounter = 0;
  private readonly BATCH_SIZE = 1;

  private pendingCommits = new Map<number, Pending>();

  private workerId: string;

  constructor(private config: Config) {
    this.secretManager = new SecretManager(config);
    this.workerId = process.argv[2] || 'default';
  }

  // ---------------- SECRETS ----------------

  private async getSecrets(): Promise<KafkaSecrets> {
    const secrets = await this.secretManager.fetchAll();

    return {
      username: secrets['FLINK_ALERT_CONFIG_USERNAME'],
      password: secrets['FLINK_ALERT_CONFIG_PASSWORD'],
      topic: secrets[KAKFA_TOPICS.BASE_TOPIC],
      brokers: secrets['FLINK_ALERT_CONFIG_BROKER'],
    };
  }

  // ---------------- INIT ----------------

  private async initKafka(): Promise<Kafka> {
    const kafkaConfig = await this.getSecrets();

    const kafkaConfigObj: any = {
      clientId: `alert-config-management-consumer-${this.workerId}`,
      brokers: JSON.parse(kafkaConfig.brokers),
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-512',
        username: kafkaConfig.username,
        password: kafkaConfig.password,
      },
      logLevel: logLevel.ERROR,
    };

    if (process.env.APP_ENV === 'LOCAL') {
      delete kafkaConfigObj.sasl;
      delete kafkaConfigObj.ssl;
    }

    return new Kafka(kafkaConfigObj);
  }

  // ---------------- START ----------------

  async start() {
    const kafka = await this.initKafka();
    const secrets = await this.getSecrets();

    this.consumer = kafka.consumer({
      groupId: 'alert-config-management-group',
    });

    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: secrets.topic,
      fromBeginning: false,
    });

    await this.consumer.run({
      autoCommit: false,
      eachBatchAutoResolve: false,

      eachBatch: async (payload: EachBatchPayload) => {
        const { batch, resolveOffset, commitOffsetsIfNecessary } = payload;

        this.consumer.pause([{ topic: batch.topic }]);

        for (let i = 0; i < batch.messages.length; i += this.BATCH_SIZE) {
          const chunk = batch.messages.slice(i, i + this.BATCH_SIZE);
          const batchId = ++this.batchCounter;

          const messages = chunk.map((m) => ({
            topic: batch.topic,
            offset: m.offset,
            key: m.key?.toString() ?? '',
            value: m.value?.toString() ?? '',
          }));

          this.pendingCommits.set(batchId, {
            messages: chunk,
            topic: batch.topic,
            partition: batch.partition,
            resolveOffset,
            commitOffsetsIfNecessary,
          });

          process.send?.({
            type: 'kafka-message',
            batchId,
            payload: messages,
          });
        }
      },
    });
  }

  // ---------------- ACK HANDLER ----------------

  async handleAck(msg: { type: 'ack'; batchId: number }) {
    if (msg.type !== 'ack') { return; }

    const state = this.pendingCommits.get(msg.batchId);
    if (!state) { return; }

    const { messages, resolveOffset, commitOffsetsIfNecessary, topic } = state;

    for (const m of messages) {
      resolveOffset(m.offset);
    }

    await commitOffsetsIfNecessary();

    this.pendingCommits.delete(msg.batchId);

    if (this.pendingCommits.size === 0) {
      this.consumer.resume([{ topic }]);
    }
  }

  // ---------------- BOOT ----------------

  async bootstrap() {
    await this.start().catch(console.error);

    process.on('message', async (msg: any) => {
      await this.handleAck(msg);
    });
  }
}