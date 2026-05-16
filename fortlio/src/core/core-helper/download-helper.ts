import { Document, ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { PipelineStage } from 'mongoose';
import { downloadCSVExportFileToS3CHSQL } from '../../queries/download.queries';
import { GetObjectCommand, GetObjectCommandInput, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SESHelper } from './ses-helper';
import { MongoDBClient } from '../core-clients/mongodb.client';
import { SecretManager } from '../core-clients/secret-manager.client';
import { S3ClientClass } from '../core-clients/aws-s3.client';
import dayjs from 'dayjs';
import { Config } from '../../interface/common.interface';
import { AppError } from '../core-utils/err-util';
import { AWS_MSGS, USER_MSGS } from '../../constants';
import { ClickHouseClient } from '../core-clients/clickhouse.client';

export class DownloadHelper {
  private dbType: 'mongodb' | 'clickhouse';
  private mongoDbClient: MongoDBClient;
  private clickHouseClient?: ClickHouseClient;
  private secretManager: SecretManager;
  private sesHelper: SESHelper;
  private s3: Promise<S3Client>;

  constructor(config: Config, dbType: 'mongodb' | 'clickhouse') {
    this.s3 = new S3ClientClass(config).getS3Client();
    this.sesHelper = new SESHelper(config);
    this.secretManager = new SecretManager(config);
    this.dbType = dbType;
    this.mongoDbClient = new MongoDBClient(config);
    if (dbType === 'clickhouse') {
      this.clickHouseClient = new ClickHouseClient(config);
    }
  }

  private async getUserInfo(userId: string) {
    try {
      const db = await this.mongoDbClient?.connect();
      const userInfo = await db?.collection('users').aggregate([{ $match: { _id: new ObjectId(userId) } }]).toArray();
      // console.info('userInfo', userInfo);    
      return userInfo[0];
    } catch (error: any) {
      throw new AppError(error.message, { msg: USER_MSGS.ERR.FAILED_TO_FETCH_USER_BY_ID, apiName: 'getUserInfo', debugValues: { userId } });
    }
  }

  public async uploadFile(file: Buffer, fileName: string, bucketName: string, expiresIn: number = 7 * 24 * 60 * 60) {
    try {
      const s3 = await this.s3;
      const putParams: PutObjectCommandInput = {
        Bucket: bucketName,
        Key: fileName,
        Body: file,
        Expires: new Date(Date.now() + expiresIn * 1000),
      };

      await s3.send(new PutObjectCommand(putParams));
      return;
    }
    catch (error: any) {
      throw new AppError(error.message, { msg: AWS_MSGS.ERR.FAILED_TO_UPLOAD_FILE, apiName: 'uploadFile', debugValues: { fileName, bucketName, expiresIn } });

    }
  };

  public async getSignedUrlForFile(fileName: string, bucketName: string) {
    try {
      const s3 = await this.s3;
      const getParams: GetObjectCommandInput = {
        Bucket: bucketName,
        Key: fileName,
      };
      const signedUrl = await getSignedUrl(s3, new GetObjectCommand(getParams), { expiresIn: 7 * 24 * 60 * 60 }); // 1 hour
      return signedUrl;
    }
    catch (error: any) {
      throw new AppError(error.message, { msg: AWS_MSGS.ERR.FAILED_TO_GET_SIGNED_URL, apiName: 'getSignedUrlForFile', debugValues: { fileName, bucketName } });
    }
  }
  public static createCSVFile(rows: Document[], fileName: string) {
    try {
      const processedRows = rows.map(row => {
        const newRow: Record<string, any> = {};

        // ❌ don’t mutate original row
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, location, ...rest } = row as any;

        for (const key in rest) {
          if (rest.hasOwnProperty(key)) {
            const value = rest[key];

            if (value instanceof Date) {
              newRow[key] = value.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
              });
            } else if (Array.isArray(value)) {
              newRow[key] = JSON.stringify(value);
            } else if (typeof value === 'object' && value !== null) {
              // flatten object
              for (const subKey in value) {
                if (value.hasOwnProperty(subKey)) {
                  newRow[`${key}.${subKey}`] = value[subKey];
                }
              }
            } else {
              newRow[key] = value;
            }
          }
        }

        return newRow;
      });

      if (processedRows.length === 0) {
        throw new AppError('No data to write');
      }

      // ✅ Extract headers
      const headers = Object.keys(processedRows[0]);

      // ✅ Convert to CSV
      const csvRows = [
        headers.join(','), // header row
        ...processedRows.map(row =>
          headers
            .map(field => {
              let val = row[field] ?? '';

              // escape quotes
              val = String(val).replace(/"/g, '""');

              // wrap in quotes if needed
              if (val.includes(',') || val.includes('\n')) {
                val = `"${val}"`;
              }

              return val;
            })
            .join(','),
        ),
      ];

      const csvContent = csvRows.join('\n');

      fs.mkdirSync(path.dirname(fileName), { recursive: true });
      fs.writeFileSync(fileName, csvContent, 'utf8');
    } catch (error: any) {
      throw new AppError(error.message, { msg: AWS_MSGS.ERR.FAILED_TO_CREATE_CSV_FILE, apiName: 'createCSVFile', debugValues: { rows, fileName } });
    }
  }
  public async exportMongoDBQueryToCSV(collectionName: string, pipeline: PipelineStage[], fileName: string, batchSize = 1000): Promise<string> {
    try {
      const db = await this.mongoDbClient?.connect();
      const rows: Document[] = [];

      const collection = db?.collection(collectionName);

      const cursor = collection
        .aggregate(pipeline, { readPreference: 'secondaryPreferred' })
        .batchSize(batchSize);

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        if (doc) { rows.push(doc); }
      }

      // 👇 change here
      DownloadHelper.createCSVFile(rows, fileName);

      const file = fs.readFileSync(fileName);

      const bucketName = await this.secretManager.get(
        'DOWNLOAD_LOGS_BUCKET_NAME',
      );

      await this.uploadFile(file, fileName, bucketName, 7 * 24 * 60 * 60);

      const url = await this.getSignedUrlForFile(fileName, bucketName);

      fs.unlinkSync(fileName);

      return url;
    } catch (error: any) {
      throw new AppError(error.message, { msg: AWS_MSGS.ERR.FAILED_TO_EXPORT_MONGODB_QUERY_TO_CSV, apiName: 'exportMongoDBQueryToCSV', debugValues: { collectionName, pipeline, fileName, batchSize } });

    }
  }

  public async exportChdbQueryToCSVS3(query: string, params: Record<string, any>, fileName: string) {
    try {
      const bucketName = await this.secretManager.get('DOWNLOAD_LOGS_BUCKET_NAME');
      const chConf = await this.secretManager.get('CLICKHOUSE_CONFIG').then((data) => JSON.parse(data));

      const finalQuery = downloadCSVExportFileToS3CHSQL.replace('{{query}}', query).replace('{{bucket}}', bucketName).replace('{{fileName}}', fileName).replace('{{roleS3ARN}}', chConf.CH_S3_ROLE_ARN);

      // console.info(finalQuery, 'finalQuery', this.clickHouseClient ,'clickHouseClient');
      await this.clickHouseClient?.query(finalQuery, params).then((response) => { console.info('Query executed successfully', response); }).catch((error) => {
        console.error(error);
        throw error;
      });
      const url = await this.getSignedUrlForFile(fileName, bucketName);
      return url;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  public async sendLogsMail(url: string, collectionName: string, userId: string, fromDate: string, toDate: string) {
    try {

      const fromEmail = await this.secretManager.get('NOTIFICATION_SENDER_EMAIL');

      const user = await this.getUserInfo(userId);

      if (!user) {
        throw new AppError(null, { msg: USER_MSGS.ERR.USER_NOT_FOUND, apiName: 'sendLogsMail.getUserByUserId', debugValues: { userId } });
      }

      const email = user.email;
      const username = `${user.firstName} ${user.lastName}`;
      const formattedCollectionName = collectionName.split('_').join(' ').toLowerCase();
      const istFromDate = dayjs(fromDate).utcOffset('+05:30').format('DD-MM-YYYY HH:mm:ss A');
      const istToDate = dayjs(toDate).utcOffset('+05:30').format('DD-MM-YYYY HH:mm:ss A');

      const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <p>Dear ${username || 'User'},</p>
        <p>
          Please find the requested ${formattedCollectionName} attached via the link below:
          <br/>
          From Date: ${istFromDate}
          <br/>
          To Date: ${istToDate}
        </p>
        <p>
          <a href="${url}" style="color: #1a73e8; text-decoration: underline;">Download  Logs</a>
        </p>
        <p>
          If you have any questions or require further assistance, please do not hesitate to contact our support team.
        </p>
        <p>
          Best regards,<br/>
          Team Fortlio Platform
        </p>
      </div>
    `;

      await this.sesHelper.sendEmail(fromEmail, email, `Requested data of ${formattedCollectionName} [${istFromDate} - ${istToDate}]`, emailBody);

      return `Email sent successfully to ${email}`;
    } catch (error: any) {
      throw new AppError(error.message, { msg: AWS_MSGS.ERR.FAILED_TO_SEND_EMAIL, apiName: 'sendLogsMail', debugValues: { url, collectionName, userId, fromDate, toDate } });
    }
  };

}
