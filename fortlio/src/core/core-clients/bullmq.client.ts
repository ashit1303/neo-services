import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { SecretManager } from './secret-manager.client';
import { Config } from '../../interface/common.interface';

type JobHandler = (job: Job) => Promise<void>;

export class BullMQService {
  private static instance: BullMQService;
  private secretManager: SecretManager;

  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private events: Map<string, QueueEvents> = new Map();

  private constructor(config: Config) {

    this.secretManager = new SecretManager(config);
  }

  static getInstance(config: Config): BullMQService {
    if (!BullMQService.instance) {
      BullMQService.instance = new BullMQService(config);
    }

    return BullMQService.instance;
  }
  private async getRedisConnectionObj(url: string) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port),
      username: parsed.username,
      password: parsed.password,
    };
  }

  private async getQueue(queueName: string): Promise<Queue> {
    if (this.queues.has(queueName)) {
      const queue = this.queues.get(queueName);
      if (queue) { return queue; }

    }

    const queue = new Queue(queueName, {
      connection: await this.getRedisConnectionObj(await this.secretManager.get('REDIS_URL')),
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.queues.set(queueName, queue);

    return queue;
  }

  async createWorker(queueName: string, handler: JobHandler, concurrency = 5) {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName);
    }
    const worker = new Worker(
      queueName,
      async (job) => {
        try {
          await handler(job);
        } catch (error: any) {
          console.error(
            `[BullMQ Worker Error] Queue: ${queueName}`,
            error,
          );
          throw error;
        }
      },
      { connection: await this.getRedisConnectionObj(await this.secretManager.get('REDIS_URL')), concurrency },
    );

    worker.on('completed', (job) => {
      console.info(
        '[BullMQ] Job completed',
        {
          queue: queueName,
          jobId: job.id,
        },
      );
    });

    worker.on('failed', (job, err) => {
      console.error('[BullMQ] Job failed', { queue: queueName, jobId: job?.id, error: err.message });
    });

    worker.on('error', (err) => {
      console.error(`[BullMQ Worker Connection Error] Queue: ${queueName}`, err);
    });

    this.workers.set(queueName, worker);

    return worker;
  }

  async createQueueEvents(queueName: string) {
    if (this.events.has(queueName)) {
      return this.events.get(queueName);
    }

    // const redis = await this.getRedisConnection();

    const events = new QueueEvents(queueName, { connection: await this.getRedisConnectionObj(await this.secretManager.get('REDIS_URL')) });

    events.on('completed', ({ jobId }) => {
      console.info('[BullMQ Events] Job completed', { queue: queueName, jobId });
    });

    events.on('failed', ({ jobId, failedReason }) => {
      console.error('[BullMQ Events] Job failed', { queue: queueName, jobId, failedReason });
    });

    this.events.set(queueName, events);

    return events;
  }

  async addJob(queueName: string, jobName: string, data: any,
    options: {
      delay?: number;
      jobId?: string;
      priority?: number;
      attempts?: number;
      removeOnComplete?: boolean | number;
      removeOnFail?: boolean | number;
    } = {},
  ) {
    const queue = await this.getQueue(queueName);

    return queue.add(jobName, data, options);
  }

  async addDelayedJob(queueName: string, jobName: string, data: any, delayInMs: number, jobId?: string) {
    const queue = await this.getQueue(queueName);
    return queue.add(jobName, data, { delay: delayInMs, jobId });
  }

  async getJob(queueName: string, jobId: string) {
    const queue = await this.getQueue(queueName);

    return queue.getJob(jobId);
  }

  async removeJob(queueName: string, jobId: string) {
    const queue = await this.getQueue(queueName);

    const job = await queue.getJob(jobId);

    if (!job) {
      return false;
    }

    await job.remove();

    return true;
  }

  async retryJob(queueName: string, jobId: string) {
    const queue = await this.getQueue(queueName);

    const job = await queue.getJob(jobId);

    if (!job) {
      return false;
    }

    await job.retry();

    return true;
  }

  async cleanQueue(queueName: string, grace = 0, limit = 1000,
    status: | 'completed' | 'wait' | 'active' | 'paused' | 'prioritized' | 'delayed' | 'failed' = 'completed',
  ) {
    const queue = await this.getQueue(queueName);

    return queue.clean(grace, limit, status);
  }

  async obliterateQueue(queueName: string) {
    const queue = await this.getQueue(queueName);

    return queue.obliterate({
      force: true,
    });
  }

  async pauseQueue(queueName: string) {
    const queue = await this.getQueue(queueName);

    return queue.pause();
  }

  async resumeQueue(queueName: string) {
    const queue = await this.getQueue(queueName);

    return queue.resume();
  }

  async getQueueCounts(queueName: string) {
    const queue = await this.getQueue(queueName);

    return queue.getJobCounts('active', 'completed', 'failed', 'delayed', 'waiting');
  }

  async close() {
    for (const worker of this.workers.values()) {
      await worker.close();
    }

    for (const queue of this.queues.values()) {
      await queue.close();
    }

    for (const event of this.events.values()) {
      await event.close();
    }
  }
}