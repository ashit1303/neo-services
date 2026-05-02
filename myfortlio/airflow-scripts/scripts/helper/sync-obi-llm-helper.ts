import { encode } from '@toon-format/toon';
import { PipelineStage } from 'mongoose';

import { BedrockAgentClient, StartIngestionJobCommand } from '@aws-sdk/client-bedrock-agent';
import { readdirSync, statSync, createReadStream } from 'fs';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import * as mongo from 'mongodb';
import { config } from '../../../config';
import { join } from 'path';

export function convertToJson(data: any) {
  return encode(data);
}

export const getDbClient = async (secrets: any) => {
  const mongoSecret = JSON.parse(secrets.MONGODB_OBEN_WEBSITE_CONFIG);
  const mongoUri = `mongodb+srv://${mongoSecret.DB_USERNAME_OBEN_WEBSITE}:${mongoSecret.DB_PASSWORD_OBEN_WEBSITE}@${mongoSecret.DB_CLUSTER_OBEN_WEBSITE}/${mongoSecret.DB_NAME_OBEN_WEBSITE}?retryWrites=true&w=majority`;
  const client = new mongo.MongoClient(mongoUri);
  await client.connect();
  return client.db(secrets.DB_NAME_OBEN_WEBSITE);
};

export const syncKnowledgeBase = async (secrets: any) => {
  const obiLLMSecrets = JSON.parse(secrets.OBI_LLM);
  const client = new BedrockAgentClient({
    region: config.awsRegion,
  });

  const command = new StartIngestionJobCommand({
    knowledgeBaseId: obiLLMSecrets.KNOWLEDGE_BASE_ID,
    dataSourceId: obiLLMSecrets.DATA_SOURCE_ID,
  });

  try {
    const response = await client.send(command);
    console.info('Ingestion started:', response);
    return response;
  } catch (error) {
    console.error('Failed to start ingestion:', error);
    throw error;
  }
};

export const getS3Client = async (secrets: any) => {
  ;
  const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    },
  });
  return s3Client;
};

export const getShowroomPipeline: PipelineStage[] = [
  { $match: { active: true } },
  {
    $project: {
      name: 1,
      map: 1,
      address: { $arrayElemAt: ['$address.address_line', 0] },
      pincode: { $arrayElemAt: ['$address.pincode', 0] },
      city: 1,
      state: 1,
    },
  },
];

// create latest data | upload files | 

export const getProductsPipeline: PipelineStage[] = [
  // 1️⃣ Group by model + variant
  {
    $group: {
      _id: { model: '$model', variant: '$variant' },
      colors: { $addToSet: '$color' },
      mrp: { $first: '$mrp' },
      addOnPrices: { $first: '$addOnPrices' },
      discountPrices: { $first: '$discountPrices' },
      totalAddOn: { $first: '$totalAddOn' },
      totalDiscount: { $first: '$totalDiscount' },
      totalPrice: { $first: '$totalPrice' },
      finalPayable: { $first: '$exShowroomPrice' },
    },
  },
  {
    $group: {
      _id: '$_id.model',
      variants: {
        $push: {
          variant: '$_id.variant',
          colors: '$colors',
          mrp: '$mrp',
          addOnPrices: '$addOnPrices',
          discountPrices: '$discountPrices',
          totalAddOn: '$totalAddOn',
          totalDiscount: '$totalDiscount',
          totalPrice: '$totalPrice',
          finalPayable: '$finalPayable',
        },
      },
    },
  },
  { $project: { _id: 0, model: '$_id', variants: 1 } },
  { $sort: { model: 1 } },
];

const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = readdirSync(dirPath);
  for (const file of files) {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
};

const deleteFolderFromS3 = async (s3Client: any, bucketName: string, prefix: string) => {
  let continuationToken: string | undefined = undefined;
  do {
    const listResponse: any = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix, ContinuationToken: continuationToken }));
    const objects = listResponse.Contents || [];
    if (objects.length > 0) {
      await s3Client.send(
        new DeleteObjectsCommand({ Bucket: bucketName, Delete: { Objects: objects.map((obj: any) => ({ Key: obj.Key })) } }),
      );
      console.info(`Deleted ${objects.length} objects`);
    }
    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);
};

// 🔹 Upload folder
const uploadFolderToS3 = async (s3Client: any, bucketName: string, folderPath: string, prefix: string) => {
  const files = getAllFiles(folderPath);
  await Promise.all(
    files.map(async (filePath) => {
      const relativePath = filePath.replace(folderPath, '').replace(/\\/g, '/');
      const s3Key = `${prefix}${relativePath}`;
      await s3Client.send(new PutObjectCommand({ Bucket: bucketName, Key: s3Key, Body: createReadStream(filePath) }));
      console.info(`Uploaded: ${s3Key}`);
    }),
  );
};

// 🔹 Main function
export const syncFolderToS3 = async (s3Client: any, folderPath: string, bucketName: string, prefix: string) => {
  try {
    console.info('🧹 Deleting existing files...');
    await deleteFolderFromS3(s3Client, bucketName, prefix);
    console.info('⬆️ Uploading new files...');
    await uploadFolderToS3(s3Client, bucketName, folderPath, prefix);
    console.info('✅ Sync complete!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
};

export const updateFileWithPayload = async (_data: any) => {
  // const dataFile = convertToJson(data);
  try {
  } catch (error) {
    console.error('Error writing files:', error);
  }
};