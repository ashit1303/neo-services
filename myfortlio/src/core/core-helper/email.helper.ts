
import { config } from '../config';
import { StatusCodes } from 'http-status-codes';
import { ERR_MSGS } from '../core-constants/error-messages';
import dayjs from 'dayjs';
import { formatErrorMessage } from '../core-utils';
import { SecretManager } from '../core-clients/secret-manager.client';
import { SESHelper } from './ses-helper';
import { UserService } from '../../services/user.service';
const userService = new UserService();

export const sendLogsMail = async (url: string, collectionName: string, userId: string, fromDate: string, toDate: string) => {
  try {
    const sesHelper = new SESHelper(config);
    const secretManager = new SecretManager(config);
    const fromEmail = await secretManager.get('NOTIFICATION_SENDER_EMAIL');

    const user = await userService.getUserByUserId(userId);

    if (!user) {
      throw formatErrorMessage(null, StatusCodes.NOT_FOUND, ERR_MSGS.USER_NOT_FOUND);
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
          Team Myfortlio Platform
        </p>
      </div>
    `;

    await sesHelper.sendEmail(fromEmail, email, `Requested data of ${formattedCollectionName} [${istFromDate} - ${istToDate}]`, emailBody);

    return `Email sent successfully to ${email}`;
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.INTERNAL_SERVER_ERROR, ERR_MSGS.FAILED_PACKET_LOGS_MAIL);
  }
};