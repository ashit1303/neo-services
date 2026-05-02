import { StatusCodes } from 'http-status-codes';
import { CreateTemplateCommand, CreateTemplateCommandInput, UpdateTemplateCommand, UpdateTemplateCommandInput, GetTemplateCommand, GetTemplateCommandInput, GetTemplateResponse, SendEmailCommand, SendEmailCommandInput, SendEmailResponse, SendRawEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { formatErrorMessage } from '../core-utils';
import { Config } from '../../interface';
import nodemailer from 'nodemailer';
import { SESClientUtil } from '../core-clients/aws-ses.client';
import { ERR_MSGS } from '../../constants/authn-err-msg.constants';
export class SESHelper {
  private sesClientUtil: SESClientUtil;

  constructor(config: Config) {
    this.sesClientUtil = new SESClientUtil(config);
  }

  async createSESTemplate(templateName: string, templateMessage: string) {
    try {
      const templateId = templateName.toLowerCase().replace(/ /g, '_');

      const templateDetails: CreateTemplateCommandInput = {
        Template: {
          TemplateName: templateId,
          SubjectPart: templateName,
          TextPart: templateMessage,
        },
      };

      const createTemplate = new CreateTemplateCommand(templateDetails);

      const sesClient = await this.sesClientUtil.getSESClient();

      await sesClient.send(createTemplate);

      return templateId;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, ERR_MSGS.FAILED_TO_CREATE_SES_TEMPLATE);
    }
  }

  async updateSESTemplate(templateName: string, subject: string, templateMessage: string) {
    try {
      const templateId = templateName.toLowerCase().replace(/ /g, '_');

      const templateDetails: UpdateTemplateCommandInput = {
        Template: {
          TemplateName: templateId,
          SubjectPart: subject,
          TextPart: templateMessage,
        },
      };

      const createTemplate = new UpdateTemplateCommand(templateDetails);

      const sesClient = await this.sesClientUtil.getSESClient();

      await sesClient.send(createTemplate);

      return templateId;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, ERR_MSGS.FAILED_TO_UPDATE_SES_TEMPLATE);
    }
  }

  async getSESTemplate(templateId: string): Promise<GetTemplateResponse> {
    try {
      const sesClient = await this.sesClientUtil.getSESClient();

      const templateDetails: GetTemplateCommandInput = {
        TemplateName: templateId,
      };

      const getTemplate = new GetTemplateCommand(templateDetails);

      const template = await sesClient.send(getTemplate);

      return template;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, ERR_MSGS.FAILED_TO_GET_SES_TEMPLATE);
    }
  }

  async sendEmail(fromAddress: string, toAddress: string, subject: string, body: string, cc = [], bcc = []) {
    try {
      const emailDetails: SendEmailCommandInput = {
        Source: fromAddress,
        Destination: {
          ToAddresses: [toAddress],
          CcAddresses: cc,
          BccAddresses: bcc,
        },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: body,
            },
          },
        },

      };

      const sendEmailCommand = new SendEmailCommand(emailDetails);

      const sesClient = await this.sesClientUtil.getSESClient();

      const response: SendEmailResponse = await sesClient.send(sendEmailCommand);

      return response;
    } catch (error) {
      throw formatErrorMessage(error, StatusCodes.FAILED_DEPENDENCY, ERR_MSGS.FAILED_TO_SEND_EMAIL_USING_SES);
    }
  }

  async sendSesEmail(
    from: string,
    toEmail: string,
    cc: string[] = [],
    bcc: string[] = [],
    subject: string,
    attachments: any[] = [],
    htmlContent: string,
    text?: string,
  ) {
    try {
      const sesClient: SESClient = await this.sesClientUtil.getSESClient();

      const transporter = nodemailer.createTransport({
        SES: {
          ses: sesClient,
          aws: { SendRawEmailCommand },
        },
      } as any);

      await transporter.sendMail({
        from,
        to: toEmail,
        cc,
        bcc,
        subject,
        html: htmlContent,
        text,
        attachments, // ✅ fully supported
      });

      console.info('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}