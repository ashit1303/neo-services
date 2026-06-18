import { Request, Response } from 'express';
import { ConnectionService } from '../services/connection.service';
import { fmtRes } from '../core/core-utils/res-util';
import { AppError } from '../core/core-utils/err-util';
import { z } from '../validations/zod';
import { IdValidation } from '../validations/common-validation';
import { CONNECTION_MSGS } from '../constants';

const CreateConnectionValidation = z.object({
  receiverId: IdValidation('receiverId'),
  message: z.string().trim().max(500).optional(),
});

const RespondConnectionValidation = z.object({
  action: z.enum(['accept', 'reject']),
});

const SendMessageValidation = z.object({
  connectionId: IdValidation('connectionId'),
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000),
});

export class ConnectionController {
  constructor(private connectionService: ConnectionService) {}

  createConnection = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'createConnection' }, 401);
      }

      const body = req.body;
      CreateConnectionValidation.parse(body);

      const connection = await this.connectionService.createConnection(loggedInUserId, body.receiverId, body.message);
      return fmtRes(res, connection);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_CREATE_CONNECTION, apiName: 'createConnection' }, error.statusCode || 400);
    }
  };

  respondToConnection = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'respondToConnection' }, 401);
      }

      const { connectionId } = req.params;
      const body = req.body;
      RespondConnectionValidation.parse(body);

      const connection = await this.connectionService.respondToConnection(connectionId, loggedInUserId, body.action);
      return fmtRes(res, connection);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_RESPOND_CONNECTION, apiName: 'respondToConnection' }, error.statusCode || 400);
    }
  };

  listConnections = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'listConnections' }, 401);
      }

      const connections = await this.connectionService.listConnections(loggedInUserId);
      return fmtRes(res, connections);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_LIST_CONNECTIONS, apiName: 'listConnections' }, 400);
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'sendMessage' }, 401);
      }

      const body = req.body;
      SendMessageValidation.parse(body);

      const chatMessage = await this.connectionService.sendMessage(loggedInUserId, body.connectionId, body.message);
      return fmtRes(res, chatMessage);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_SEND_MESSAGE, apiName: 'sendMessage' }, error.statusCode || 400);
    }
  };

  getChatHistory = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'getChatHistory' }, 401);
      }

      const { connectionId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;

      const chatHistory = await this.connectionService.getChatHistory(connectionId, loggedInUserId, page, pageSize);
      return fmtRes(res, chatHistory);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_FETCH_HISTORY, apiName: 'getChatHistory' }, error.statusCode || 400);
    }
  };

  listNotifications = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'listNotifications' }, 401);
      }

      const notifications = await this.connectionService.listNotifications(loggedInUserId);
      return fmtRes(res, notifications);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_FETCH_NOTIFICATIONS, apiName: 'listNotifications' }, 400);
    }
  };

  markNotificationAsRead = async (req: Request, res: Response) => {
    try {
      const loggedInUserId = req.headers.userId as string;
      if (!loggedInUserId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'markNotificationAsRead' }, 401);
      }

      const { notificationId } = req.params;
      const notification = await this.connectionService.markNotificationAsRead(notificationId, loggedInUserId);
      return fmtRes(res, notification);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_MARK_NOTIFICATION, apiName: 'markNotificationAsRead' }, error.statusCode || 400);
    }
  };
}
