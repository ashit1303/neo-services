import mongoose, { PipelineStage } from 'mongoose';
import Connection from '../models/connection.model';
import ChatMessage from '../models/chat-message.model';
import Notification from '../models/notification.model';
import User from '../models/user.model';
import { AppError } from '../core/core-utils/err-util';
import { CONNECTION_MSGS } from '../constants';

export class ConnectionService {
  async createConnection(senderId: string, receiverId: string, message?: string) {
    try {
      const senderObjectId = new mongoose.Types.ObjectId(senderId);
      const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

      // Check if user is trying to connect with themselves
      if (senderId === receiverId) {
        throw new AppError(CONNECTION_MSGS.ERR.CANNOT_CONNECT_SELF, { apiName: 'createConnection' }, 400);
      }

      // Check if connection already exists
      const existing = await Connection.findOne({
        $or: [
          { senderId: senderObjectId, receiverId: receiverObjectId },
          { senderId: receiverObjectId, receiverId: senderObjectId },
        ],
      });

      if (existing) {
        throw new AppError(CONNECTION_MSGS.ERR.CONNECTION_EXISTS, { apiName: 'createConnection' }, 400);
      }

      const connection = new Connection({
        senderId: senderObjectId,
        receiverId: receiverObjectId,
        message: message || '',
        status: 'pending',
      });

      await connection.save();

      // Send notification to receiver
      const sender = await User.findById(senderObjectId).lean();
      const senderName = sender?.fullName || 'Someone';

      const notification = new Notification({
        userId: receiverObjectId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${senderName} wants to connect with you.`,
        metadata: {
          connectionId: connection._id,
          senderId: senderObjectId,
        },
      });
      await notification.save();

      return connection;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_CREATE_CONNECTION, apiName: 'createConnection' });
    }
  }

  async respondToConnection(connectionId: string, receiverId: string, action: 'accept' | 'reject') {
    try {
      const connectionObjectId = new mongoose.Types.ObjectId(connectionId);
      const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

      const connection = await Connection.findById(connectionObjectId);
      if (!connection) {
        throw new AppError(CONNECTION_MSGS.ERR.REQUEST_NOT_FOUND, { apiName: 'respondToConnection' }, 404);
      }

      if (connection.receiverId.toString() !== receiverId) {
        throw new AppError(CONNECTION_MSGS.ERR.UNAUTHORIZED_ACCESS, { apiName: 'respondToConnection' }, 403);
      }

      if (connection.status !== 'pending') {
        throw new AppError(CONNECTION_MSGS.ERR.REQUEST_NOT_PENDING, { apiName: 'respondToConnection' }, 400);
      }

      connection.status = action === 'accept' ? 'accepted' : 'rejected';
      await connection.save();

      // If accepted, send notification to sender
      if (action === 'accept') {
        const receiver = await User.findById(receiverObjectId).lean();
        const receiverName = receiver?.fullName || 'Someone';

        const notification = new Notification({
          userId: connection.senderId,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          message: `${receiverName} accepted your connection request.`,
          metadata: {
            connectionId: connection._id,
            receiverId: receiverObjectId,
          },
        });
        await notification.save();
      }

      return connection;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_RESPOND_CONNECTION, apiName: 'respondToConnection' });
    }
  }

  async listConnections(userId: string) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const connections = await Connection.find({
        $or: [
          { senderId: userObjectId },
          { receiverId: userObjectId },
        ],
      })
        .populate('senderId', 'fullName email')
        .populate('receiverId', 'fullName email')
        .exec();

      return connections;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_LIST_CONNECTIONS, apiName: 'listConnections' });
    }
  }

  async sendMessage(senderId: string, connectionId: string, message: string) {
    try {
      const senderObjectId = new mongoose.Types.ObjectId(senderId);
      const connectionObjectId = new mongoose.Types.ObjectId(connectionId);

      const connection = await Connection.findById(connectionObjectId);
      if (!connection) {
        throw new AppError(CONNECTION_MSGS.ERR.CONNECTION_NOT_FOUND, { apiName: 'sendMessage' }, 404);
      }

      if (connection.status !== 'accepted') {
        throw new AppError(CONNECTION_MSGS.ERR.CONNECTION_NOT_ACCEPTED, { apiName: 'sendMessage' }, 400);
      }

      const isSender = connection.senderId.toString() === senderId;
      const isReceiver = connection.receiverId.toString() === senderId;

      if (!isSender && !isReceiver) {
        throw new AppError(CONNECTION_MSGS.ERR.NOT_PART_OF_CONNECTION, { apiName: 'sendMessage' }, 403);
      }

      const receiverId = isSender ? connection.receiverId : connection.senderId;

      const chatMessage = new ChatMessage({
        connectionId: connectionObjectId,
        senderId: senderObjectId,
        receiverId,
        message,
      });

      await chatMessage.save();

      // Create message notification
      const sender = await User.findById(senderObjectId).lean();
      const senderName = sender?.fullName || 'Someone';

      const notification = new Notification({
        userId: receiverId,
        type: 'new_message',
        title: 'New Chat Message',
        message: `${senderName} sent you a message.`,
        metadata: {
          connectionId: connection._id,
          messageId: chatMessage._id,
        },
      });
      await notification.save();

      // Broadcast chat message to the recipient's topic and connection topic
      const wsPayload = {
        event: 'new_message',
        data: {
          _id: chatMessage._id.toString(),
          connectionId: connection._id.toString(),
          senderId: senderId,
          receiverId: receiverId.toString(),
          message: message,
          createdAt: chatMessage.createdAt,
        },
      };

      try {
        const { wsHandler: sharedWsHandler } = require('../clients');
        sharedWsHandler.sendToSubscribers(`user_${receiverId}`, wsPayload);
        sharedWsHandler.sendToSubscribers(`connection_${connection._id}`, wsPayload);
      } catch (err: any) {
        console.error('Failed to broadcast message via WebSocket:', err.message || err);
      }

      return chatMessage;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_SEND_MESSAGE, apiName: 'sendMessage' });
    }
  }

  async getChatHistory(connectionId: string, userId: string, page = 1, pageSize = 20) {
    try {
      const connectionObjectId = new mongoose.Types.ObjectId(connectionId);

      const connection = await Connection.findById(connectionObjectId);
      if (!connection) {
        throw new AppError(CONNECTION_MSGS.ERR.CONNECTION_NOT_FOUND, { apiName: 'getChatHistory' }, 404);
      }

      const senderId = connection.senderId;
      const receiverId = connection.receiverId;

      if (senderId.toString() !== userId && receiverId.toString() !== userId) {
        throw new AppError(CONNECTION_MSGS.ERR.NOT_PART_OF_CONNECTION, { apiName: 'getChatHistory' }, 403);
      }

      const limit = Number(pageSize);
      const skip = (Number(page) - 1) * limit;

      const pipeline: PipelineStage[] = [
        { $match: { connectionId: connectionObjectId, $or: [{ senderId: senderId, receiverId: receiverId }, { senderId: receiverId, receiverId: senderId }] } },
        { $sort: { createdAt: -1 as const } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const result = await ChatMessage.aggregate(pipeline).exec();
      const data = result[0]?.data || [];
      const totalCount = result[0]?.totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data,
        totalCount,
        totalPages,
        currentPage: page,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_FETCH_HISTORY, apiName: 'getChatHistory' });
    }
  }

  async listNotifications(userId: string) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      return await Notification.find({ userId: userObjectId }).sort({ createdAt: -1 }).exec();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_FETCH_NOTIFICATIONS, apiName: 'listNotifications' });
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      const notificationObjectId = new mongoose.Types.ObjectId(notificationId);
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const notification = await Notification.findOne({ _id: notificationObjectId, userId: userObjectId });
      if (!notification) {
        throw new AppError(CONNECTION_MSGS.ERR.NOTIFICATION_NOT_FOUND, { apiName: 'markNotificationAsRead' }, 404);
      }

      notification.isRead = true;
      await notification.save();

      return notification;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'unknown', { msg: CONNECTION_MSGS.ERR.FAILED_TO_MARK_NOTIFICATION, apiName: 'markNotificationAsRead' });
    }
  }
}
