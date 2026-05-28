import * as childProcess from 'child_process';
import * as path from 'path';
// import { sendEmail } from './notification-helper-v2';
const moduleName = 'kafka-comms-consumer';
let isShuttingDown = false;
const workers: childProcess.ChildProcess[] = [];

const isTs = __filename.endsWith('.ts');
const forkConsumer: string = isTs ? path.resolve(__dirname, `./${moduleName}.ts`) : path.resolve(__dirname, `./${moduleName}.js`);

export function createKafkaWorker(id: number) {
  const worker = childProcess.fork(forkConsumer, [String(id)]);

  worker.on('message', async (msg: any) => {
    if (msg.type === 'kafka-message') { await processMessage(msg.payload); }
    worker.send({ type: 'ack', batchId: msg.batchId });
  });

  worker.on('exit', (code, signal) => {
    console.info(`Worker ${id} exited. code=${code} signal=${signal}`);
    if (isShuttingDown) { return; } // ignore restarts if shutting down
    setTimeout(() => {
      workers[id] = createKafkaWorker(id);
    }, 2000);
  });

  return worker;
}

async function processMessage(payload: [{ topic: string; key: string; value: string; offset: string; }]) {
  payload.forEach(async ele => {
    try {
      const parsedValue = JSON.parse(ele.value);
      const { imei, code, params } = parsedValue;
      // await sendMessageToTriggerComms(parsedValue);
      console.info(`Processing: ${ele.value}, imei: ${imei}, code: ${code}, params: ${params}`);

    } catch (err) {
      console.error(err);
    }
  });
}

process.on('SIGINT', async () => {
  console.info(' 🛑 Stopping kafka worker...');

  isShuttingDown = true;

  for (const w of workers) {
    w.kill('SIGTERM');
  }

  process.exit(0);
});
