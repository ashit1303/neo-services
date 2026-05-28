import * as path from 'path';
// import { ERR_MSGS } from '../constants/error-messages';
import { WorkerData } from '../../interface/worker-interface';
import { Worker, WorkerOptions } from 'worker_threads';
import { Config } from '../../interface/common.interface';

export class ExportHelper {
  private config: Config;
  constructor(config: Config) {
    this.config = config;
  }
  public prepareLogsDownload(data: WorkerData): void {
    const workerData = { config: this.config, ...data };
    const isTs = __filename.endsWith('.ts');
    const workerFile = isTs ? path.resolve(__dirname, '../worker/downloadlog.worker.ts') : path.resolve(__dirname, '../worker/downloadlog.worker.js');

    const workerOptions: WorkerOptions = {
      workerData: workerData,
      stderr: true,
      stdout: true,
      execArgv: isTs ? ['-r', 'bun run/register'] : undefined,
    };
    const worker = new Worker(workerFile, workerOptions);

    worker.on('message', () => {
      console.info('Worker finished:', workerData);
    });

    worker.on('error', (err: any) => {
      console.error('Worker error:', err);
    });

    worker.on('exit', (code: any) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  }

}

