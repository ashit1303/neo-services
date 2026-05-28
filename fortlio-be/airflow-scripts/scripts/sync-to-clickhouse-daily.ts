// sync data
import { PipelineStage } from 'mongoose';
import { config } from '../../config';
import { MongoDBClient } from '../../src/core/core-clients/mongodb.client';
import { ClickHouseClient } from '../../src/core/core-clients/clickhouse.client';
import { AppError } from '../../src/core/core-utils/err-util';
const mongoClient = new MongoDBClient(config);
const clickhouseClient = new ClickHouseClient(config);

const last1Day = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
last1Day.setHours(0, 0, 0, 0);
const batchSize = 50;
let count = 0;
const failedCount = 0;
const failedImei: string[] = [];

const clickhouseInsertQuery = 'INSERT INTO data (model, status, type) VALUES ';
const syncLatestCreatedOrUpdatedData = async (): Promise<String> => {
  try {
    // model: X02 -> ez 3.4, X03 -> ez 4.4, X04 -> ez sigma 3.4, X05 -> ez sigma 4.4 //low cardinality 
    // type : 1 -> oben 2 -> connectm 3 -> thingsup // low cardinality 
    // status :'FACTORY', 'SHOWROOM', 'STOCK', 'SOLD', 'TESTING'
    const db = await mongoClient.connect();
    const dataCollection = db.collection('data');

    const getLatestAndUpdatedData: PipelineStage[] = [
      { $match: { $or: [{ createdAt: { $gte: last1Day }, updatedAt: { $gte: last1Day } }] } },
    ];

    const getLatestAndUpdatedDataResp = dataCollection.aggregate(getLatestAndUpdatedData);

    const dataToInsert: any[] = [];
    for await (const data of getLatestAndUpdatedDataResp) {
      dataToInsert.push({
        type: data.type,
      });
      count++;
      if (dataToInsert.length === batchSize) {
        const clickhouseInsertQueryBatch = clickhouseInsertQuery + getFormatedInsertQuery(dataToInsert);
        await clickhouseClient.execute(clickhouseInsertQueryBatch).catch((err) => console.error('err in inserting to clickhouse', err));
        dataToInsert.length = 0;
      }
    }

    if (dataToInsert.length > 0) {
      const clickhouseInsertQueryBatch = clickhouseInsertQuery + getFormatedInsertQuery(dataToInsert);
      await clickhouseClient.execute(clickhouseInsertQueryBatch);
    }

    console.info('Failed Count', failedCount);
    console.info('Failed Imeis', failedImei.join(','));

    return 'Successfully inserted ' + count + ' data';
  } catch (error: any) {
    console.error('Failed', error);
    return 'Failed';
  }
  finally {
    clickhouseClient.close();
    mongoClient.close();
  }
};

const main = async () => {
  try {
    const output = await syncLatestCreatedOrUpdatedData();
    console.info('Task Executed:', output);
    if (output === 'Failed') {
      throw new AppError('Failed');
    }
    process.exit(0);
  } catch (error: any) {
    console.error(' Failed', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

main();

