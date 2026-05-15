// mongodb-backup.ts
import { execSync } from 'child_process';
// import { createWriteStream } from 'fs';
import { config } from '../../config';

// cd airflow-scripts
// for new db 
// usage BUN_ENV=dev bun run ./scripts/mongodb-restore.ts mongodb+srv://user:password@fortlio-db-staging.hsldq6v.mongodb.net/?retryWrites=true&w=majority&appName=fortlio-db-staging
// for local
// usage BUN_ENV=dev bun run ./scripts/mongodb-restore.ts local

import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
// import { createGzip } from 'zlib';
// import { join } from 'path';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as mongo from 'mongodb';
import { SecretManager } from '../../src/core/core-clients/secret-manager.client';
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
  const awsConfig = await secretManger.get('AWS_CONFIG').then((res) => JSON.parse(res));
  const mongoConfig = await secretManger.get('MONGO_BASE_CONFIG').then((res) => JSON.parse(res));
  const dbAndS3Config: any = {
    DB_USERNAME: mongoConfig['USERNAME'],
    DB_PASSWORD: mongoConfig['PASSWORD'],
    DB_CLUSTER: mongoConfig['CLUSTER'],
    DB_NAME: mongoConfig['NAME'],
    AWS_ACCESS_KEY_ID: awsConfig['AWS_ACCESS_KEY_ID'],
    AWS_SECRET_ACCESS_KEY: awsConfig['AWS_SECRET_ACCESS_KEY'],
    AWS_BACKUP_BUCKET: awsConfig['AWS_BACKUP_BUCKET'],

  };

  return dbAndS3Config;
};

// Find backup file from specified days ago
const findBackupFile = async (daysOld: number): Promise<string> => {
  const secrets = await getSecrets();
  const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const { Contents } = await s3Client.send(new ListObjectsV2Command({
      Bucket: secrets.AWS_BACKUP_BUCKET,
      Prefix: 'mongodb_backups/',
    }));

    if (!Contents || Contents.length === 0) {
      throw new Error('No backup files found in S3');
    }

    // Sort backups by LastModified (newest first)
    const sorted = [...Contents].sort((a, b) =>
      (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));

    // Get the backup from specified days ago
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysOld);

    const backupFile = sorted.find(file => {
      const fileDate = file.LastModified;
      if (!fileDate) { return false; }
      return fileDate.getDate() === targetDate.getDate() &&
        fileDate.getMonth() === targetDate.getMonth() &&
        fileDate.getFullYear() === targetDate.getFullYear();
    });

    if (!backupFile || !backupFile.Key) {
      throw new Error(`No backup found from ${daysOld} days ago`);
    }

    return backupFile.Key;
  } catch (error) {
    throw new Error(`Failed to find backup file: ${error}`);
  }
};

// Download backup from S3
const downloadBackup = async (s3Key: string): Promise<string> => {
  const secrets = await getSecrets();
  const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    },
  });

  const timestamp = String(Math.floor(Date.now() / 1000));
  const downloadDir = `/tmp/mongo_restore_${timestamp}`;
  const tarPath = `${downloadDir}.tar.gz`;

  try {
    mkdirSync(downloadDir, { recursive: true });

    const { Body } = await s3Client.send(new GetObjectCommand({
      Bucket: secrets.AWS_BACKUP_BUCKET,
      Key: s3Key,
    }));

    if (!Body) {
      throw new Error('No data received from S3');
    }

    // Convert stream to buffer and write to file
    const buffer = await Body.transformToByteArray();
    writeFileSync(tarPath, Buffer.from(buffer));

    // Extract the tar.gz file
    execSync(`tar -xzf ${tarPath} -C ${downloadDir}`, { stdio: 'inherit' });

    return downloadDir;
  } catch (error) {
    // Cleanup on failure
    if (existsSync(downloadDir)) {
      rmSync(downloadDir, { recursive: true, force: true });
    }
    if (existsSync(tarPath)) {
      rmSync(tarPath);
    }
    throw new Error(`Failed to download and extract backup: ${error}`);
  }
};

// Restore MongoDB collections
const restoreCollections = async (restoreDir: string, dbType: string): Promise<void> => {
  const secrets = await getSecrets();
  const mongoUri = dbType === 'local' ? `mongodb://localhost:27017/${secrets.DB_NAME}` : `${dbType}`;
  const CONNECTION_DB_NAME = dbType === 'local' ? secrets.DB_NAME : mongoUri.split('@')[1].split('.')[0];

  try {
    const client = new mongo.MongoClient(mongoUri);
    await client.connect();
    client.db(secrets.DB_NAME);

    // Get list of collections from the backup directory
    const backupDbDir = `${restoreDir}/${secrets.DB_NAME}`;
    const files = execSync(`ls ${backupDbDir}`)
      .toString()
      .split('\n')
      .filter(name => name && name.endsWith('.bson')); // Only get .bson files

    // Group files by collection name (removing .bson and .metadata.json)
    const collections = new Set(
      files.map(file => file.replace('.bson', '').replace('.metadata.json', '')),
    );

    // Restore each collection
    for (const collection of collections) {
      const bsonFile = `${backupDbDir}/${collection}.bson`;
      const metadataFile = `${backupDbDir}/${collection}.metadata.json`;

      if (!existsSync(bsonFile) || !existsSync(metadataFile)) {
        console.warn(`Skipping ${collection} - missing required files`);
        continue;
      }

      const cmd = `mongorestore --uri="${mongoUri}" --drop --db="${CONNECTION_DB_NAME}" --collection="${collection}" "${bsonFile}"`;

      execSync(cmd, { stdio: 'inherit' });
      console.info(`Restored collection: ${collection}`);
    }

    await client.close();
  } catch (error) {
    throw new Error(`Failed to restore collections: ${error}`);
  }
};

// Main restore flow
const mainRestore = async (daysOldFile: number, dbType: string) => {
  try {
    console.info(`Starting MongoDB restore process for backup from ${daysOldFile} days ago...`);

    // Step 1: Find the appropriate backup file
    const backupFileKey = await findBackupFile(daysOldFile);
    console.info(`Found backup file: ${backupFileKey}`);

    // Step 2: Download and extract the backup
    const restoreDir = await downloadBackup(backupFileKey);
    console.info(`Backup downloaded and extracted to: ${restoreDir}`);

    // Step 3: Restore collections
    await restoreCollections(restoreDir, dbType);
    console.info('Collections restored successfully');

    // Cleanup
    rmSync(restoreDir, { recursive: true, force: true });

    console.info('Restore process completed successfully');
  } catch (error) {
    console.error('Restore process failed:', error);
    process.exit(1);
  }
};

// Get daysOldFile from command line argument
let daysOldFile = parseInt(process.argv[2], 10);
if (isNaN(daysOldFile)) {
  daysOldFile = 0;
}
let dbType = process.argv[3];
if (!dbType) {
  dbType = 'local';
}

// Run the main function
mainRestore(daysOldFile, dbType);