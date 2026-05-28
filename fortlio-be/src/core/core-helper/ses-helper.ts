import nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { AWS_MSGS } from '../../constants';
import { AppError } from '../core-utils/err-util';
import type { SESClientUtil } from '../core-clients/aws-ses.client';

export class SESHelper {
  constructor(private sesClientUtil: SESClientUtil) {}

  public async sendSesEmail(from: string, toEmail: string, cc: string[] = [], bcc: string[] = [], subject: string, attachments: any[] = [], htmlContent: string, text?: string) {
    try {
      const sesClient: SESv2Client = await this.sesClientUtil.getSESClient();
      const transporter = nodemailer.createTransport({ SES: { sesClient, SendEmailCommand } } as any);
      await transporter.sendMail({ from, to: toEmail, cc, bcc, subject, html: htmlContent, text, attachments });
      console.info('Email sent successfully');
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: AWS_MSGS.ERR.FAILED_TO_SEND_EMAIL, apiName: 'sendSesEmail' });
    }
  }
}

// import nodemailer from 'nodemailer';
// import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-sesv2';
// import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
// import { AWS_MSGS } from '../../constants';
// import { AppError } from '../core-utils/err-util';
// const stsClient = new STSClient({ region: 'ap-south-1' });
// let cachedCreds: any = null;
// let credsExpiration: Date | null = null;
// async function getTempCreds() {
//   const now = new Date();
//   if (cachedCreds && credsExpiration && now < credsExpiration) { return cachedCreds; }
//   const command = new AssumeRoleCommand({ RoleArn: process.env.SES_CROSS_ACCOUNT_ROLE_ARN!, RoleSessionName: 'SESAccessSession', DurationSeconds: 3600 });
//   const response = await stsClient.send(command);
//   cachedCreds = { accessKeyId: response.Credentials!.AccessKeyId!, secretAccessKey: response.Credentials!.SecretAccessKey!, sessionToken: response.Credentials!.SessionToken! };
//   credsExpiration = new Date(response.Credentials!.Expiration!.getTime() - 60 * 1000);
//   return cachedCreds;
// }
// async function getSESClient() {
//   const credentials = await getTempCreds();
//   return new SESClient({ region: 'ap-south-1', credentials });
// }
// export const sendSesEmail = async (from: string, toEmail: string, cc: string[] = [], bcc: string[] = [], subject: string, attachments: any[] = [], htmlContent: string, text?: string) => {
//   try {
//     const sesClient = await getSESClient();
//     const transporter = nodemailer.createTransport({ SES: { ses: sesClient, aws: { SendRawEmailCommand } } } as any);
//     await transporter.sendMail({ from, to: toEmail, cc, bcc, subject, html: htmlContent, text, attachments });
//     console.info('Email sent successfully');
//   } catch (error: any) {
//     throw new AppError(error.message || 'unknown', {
//       msg: AWS_MSGS.ERR.FAILED_TO_SEND_EMAIL,
//       apiName: 'sendSesEmail',
//     });
//   }
// };