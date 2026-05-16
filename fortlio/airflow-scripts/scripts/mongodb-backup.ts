// mongodb-backup.ts
import { execSync } from 'child_process';
// import { createWriteStream } from 'fs';
import { config } from '../../config';

import { readFileSync, mkdirSync, rmSync, existsSync } from 'fs';
// import { createGzip } from 'zlib';
// import { join } from 'path';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as mongo from 'mongodb';
import { SecretManager } from '../../src/core/core-clients/secret-manager.client';
import { AppError } from '../../src/core/core-utils/err-util';
const secretManger = new SecretManager(config);

// Interface for our secrets
interface Secrets {
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_CLUSTER: string;
  DB_NAME: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_BACKUP_BUCKET: string;
}

// Get secrets from AWS Secrets Manager
const getSecrets = async (): Promise<Secrets> => {
  const secrets = await secretManger.fetchAll();
  const dbAndS3Config: any = {
    DB_USERNAME: secrets['DB_USERNAME'],
    DB_PASSWORD: secrets['DB_PASSWORD'],
    DB_CLUSTER: secrets['DB_CLUSTER'],
    DB_NAME: secrets['DB_NAME'],
    AWS_ACCESS_KEY_ID: secrets['AWS_ACCESS_KEY_ID'],
    AWS_SECRET_ACCESS_KEY: secrets['AWS_SECRET_ACCESS_KEY'],
    AWS_BACKUP_BUCKET: secrets['AWS_BACKUP_BUCKET'],
  };
  return dbAndS3Config;
};

// Create MongoDB dump
const createMongoDump = async (): Promise<string> => {
  const secrets = await getSecrets();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const dumpDir = `/tmp/mongo_backup_${timestamp}`;

  try {
    mkdirSync(dumpDir, { recursive: true });

    const mongoUri = `mongodb+srv://${secrets.DB_USERNAME}:${secrets.DB_PASSWORD}@${secrets.DB_CLUSTER}/?retryWrites=true&w=majority`;

    const client = new mongo.MongoClient(mongoUri);
    await client.connect();
    const db = client.db(secrets.DB_NAME);
    const collections = (await db.listCollections().toArray())
      .map(c => c.name)
      .filter(name => !name.startsWith('system.') && name !== 'users' && !name.includes('log'));

    // collections.length = 1;
    for (const collection of collections) {
      const cmd = `mongodump --uri="${mongoUri}" --db=${secrets.DB_NAME} --collection=${collection} --out=${dumpDir}`;
      execSync(cmd, { stdio: 'inherit' });
    }

    await client.close();
    return dumpDir;
  } catch (error: any) {
    // Cleanup on failure
    if (existsSync(dumpDir)) {
      rmSync(dumpDir, { recursive: true, force: true });
    }
    throw new AppError(`MongoDB dump failed: ${error}`);
  }
};

// Compress directory to tar.gz
const compressDirectory = (directory: string): string => {
  const tarPath = `${directory}.tar.gz`;

  try {
    const tarCreateCmd = `tar -czf ${tarPath} -C ${directory} .`;
    execSync(tarCreateCmd, { stdio: 'inherit' });
    return tarPath;
  } catch (error: any) {
    if (existsSync(tarPath)) {
      rmSync(tarPath);
    }
    throw new AppError(`Compression failed: ${error}`);
  }
};

// Upload to S3 and rotate backups
const uploadToS3 = async (filePath: string): Promise<void> => {
  const secrets = await getSecrets();
  const s3Client = new S3Client({
    region: config.awsRegion, // or your region
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucketName = secrets.AWS_BACKUP_BUCKET;
  const s3Key = `mongodb_backups/${filePath.split('/').pop()}`;

  try {
    // Upload the new backup
    const fileContent = readFileSync(filePath);
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
    }));

    // Rotate backups (keep last 3)
    const { Contents } = await s3Client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'mongodb_backups/',
    }));

    if (Contents && Contents.length > 3) {
      // Sort by LastModified (oldest first)
      const sorted = [...Contents].sort((a, b) =>
        (a.LastModified?.getTime() || 0) - (b.LastModified?.getTime() || 0));

      // Delete all but the newest 3
      for (const object of sorted.slice(0, -3)) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: object.Key,
        }));
      }
    }
  } catch (error: any) {
    throw new AppError(`S3 operation failed: ${error}`);
  }
};

// Main backup flow
const main = async () => {
  try {
    console.info('Starting MongoDB backup process...');

    // Step 1: Create MongoDB dump
    const dumpDir = await createMongoDump();
    console.info(`MongoDB dump created at: ${dumpDir}`);

    // Step 2: Compress the dump
    const tarPath = compressDirectory(dumpDir);
    console.info(`Compressed dump created at: ${tarPath}`);

    // Step 3: Upload to S3
    await uploadToS3(tarPath);
    console.info('Backup successfully uploaded to S3');

    // Cleanup
    rmSync(dumpDir, { recursive: true, force: true });
    rmSync(tarPath);

    console.info('Backup process completed successfully');
  } catch (error: any) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
};

// Run the main function
main();