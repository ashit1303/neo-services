import { mdToPdf } from 'md-to-pdf';
import { S3ClientClass } from '../core-clients/aws-s3.client';
import { secretManager } from '../../clients';
import { config } from '../../../config';
import { PutObjectCommand, PutObjectCommandInput, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from './err-util';
import * as path from 'path';

export interface S3UploadOptions { storeInS3: boolean; bucketName?: string; fileName?: string; expiresIn?: number; }

/**
 * Converts a markdown string to PDF buffer, and optionally uploads it to S3.
 *
 * @param markdown - The markdown content string to be converted.
 * @param settings - The md-to-pdf configuration options (e.g. style/layout).
 * @param s3Options - The S3 configuration options for storing the generated PDF.
 * @returns An object containing the generated PDF buffer and optionally the S3 signed URL.
 */
export async function convertMdToPdf(markdown: string, settings?: any, s3Options?: S3UploadOptions): Promise<{ pdfBuffer: Buffer; s3Url?: string }> {
  // 1. Enforce size limit on markdown content (e.g. 5MB)
  if (markdown.length > 5 * 1024 * 1024) {
    throw new AppError('Markdown content exceeds maximum size of 5MB', undefined, 400);
  }

  let pdfBuffer: Buffer;
  try {
    const options = {
      ...settings,
      launch_options: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...(settings?.launch_options || {}),
      },
    };

    const output = await mdToPdf({ content: markdown }, options);
    pdfBuffer = output.content;
  } catch (err: any) {
    throw new AppError(`Failed to convert markdown to PDF: ${err.message}`, { error: err });
  }

  let s3Url: string | undefined;

  if (s3Options?.storeInS3) {
    try {
      // Initialize S3 client using the standard class
      const s3ClientClass = new S3ClientClass(config);
      const s3Client = await s3ClientClass.getS3Client();

      // Retrieve default bucket if not specified
      let bucketName = s3Options.bucketName;
      if (!bucketName) {
        try {
          bucketName = await secretManager.get('DOWNLOAD_LOGS_BUCKET_NAME');
        } catch {
          try {
            const awsConfig = await secretManager.get('AWS_CONFIG').then((res) => JSON.parse(res));
            bucketName = awsConfig.AWS_BACKUP_BUCKET;
          } catch {
            throw new Error('S3 bucket name is not configured (DOWNLOAD_LOGS_BUCKET_NAME or AWS_BACKUP_BUCKET not found)');
          }
        }
      }

      if (!bucketName) {
        throw new Error('S3 bucket name is not configured or provided');
      }

      // Generate secure filename: sanitize any provided filename or fallback to timestamp-based name
      let safeFileName = s3Options.fileName ? path.basename(s3Options.fileName) : `pdf-${Date.now()}-${Math.floor(Math.random() * 1000)}.pdf`;
      if (!safeFileName.endsWith('.pdf')) {
        safeFileName += '.pdf';
      }

      const expiresIn = s3Options.expiresIn || 7 * 24 * 60 * 60; // default 7 days

      const putParams: PutObjectCommandInput = {
        Bucket: bucketName,
        Key: safeFileName,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        Expires: new Date(Date.now() + expiresIn * 1000),
      };

      await s3Client.send(new PutObjectCommand(putParams));

      // Generate signed URL
      const getParams: GetObjectCommandInput = {
        Bucket: bucketName,
        Key: safeFileName,
      };
      s3Url = await getSignedUrl(s3Client, new GetObjectCommand(getParams), { expiresIn });
    } catch (err: any) {
      throw new AppError(`Failed to upload generated PDF to S3: ${err.message}`, { error: err });
    }
  }

  return { pdfBuffer, s3Url };
}