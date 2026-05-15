import { parentPort, workerData } from 'worker_threads';
import { WorkerDataConfig, WorkerResponse } from '../../interface/worker-interface';
import { DownloadHelper } from '../core-helper/download-helper';
import { COMMON_MSGS } from '../../constants';

const downloadLogsFileWorker = async () => {
  const { dbType, collectionName, pipeline, query, params, userId, fileName, config } = workerData as WorkerDataConfig;
  try {
    const helper = new DownloadHelper(config, dbType === 'mongodb' ? 'mongodb' : 'clickhouse');
    let url = '';
    if (dbType === 'mongodb' && collectionName && pipeline) {
      url = await helper.exportMongoDBQueryToCSV(collectionName, pipeline, fileName + '.xlsx', 1000);
    }
    else if (dbType === 'clickhouse' && query && params) {
      url = await helper.exportChdbQueryToCSVS3(query, params, fileName + '.csv');
    }
    const fileContext = fileName.split('_')[0];
    await helper.sendLogsMail(url, fileContext, userId, fileName.split('_from_')[1].split('_')[0], fileName.split('_to_')[1].split('_')[0]);
    const result: WorkerResponse = { SUCCESS: true, message: 'Excel sheet request submitted successfully, you will get mail shortly' };
    parentPort?.postMessage(result);
  } catch (error: any) {
    console.error(error);
    const result: WorkerResponse = {
      SUCCESS: false, error: error.message || COMMON_MSGS.ERR.FAILED_WORKER_DOWNLOAD_LOGS_FILE,
    };
    parentPort?.postMessage(result);
  }
};

downloadLogsFileWorker();