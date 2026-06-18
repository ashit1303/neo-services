import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { AppError } from '../src/core/core-utils/err-util';
import { ConnectionController } from '../src/controller/connection.controller';
import { Request, Response } from 'express';

describe('ConnectionController Unit Tests', () => {
  let connectionController: ConnectionController;
  let mockConnectionService: any;
  let mockRes: any;

  const mockResponse = () => {
    const res: any = {};
    res.status = mock((code: number) => {
      res.statusCode = code;
      return res;
    });
    res.send = mock((body: any) => {
      res.body = body;
      return res;
    });
    res.json = mock((body: any) => {
      res.body = body;
      return res;
    });
    return res as unknown as Response;
  };

  const VALID_USER_ID = '123456789012345678901234';
  const VALID_RECEIVER_ID = '567890123456789012345678';
  const VALID_CONN_ID = '678901234567890123456789';

  beforeEach(() => {
    mockConnectionService = {
      createConnection: mock(() => Promise.resolve({
        _id: VALID_CONN_ID,
        senderId: VALID_USER_ID,
        receiverId: VALID_RECEIVER_ID,
        status: 'pending',
        message: 'Hello!',
      })),
      respondToConnection: mock(() => Promise.resolve({
        _id: VALID_CONN_ID,
        senderId: VALID_USER_ID,
        receiverId: VALID_RECEIVER_ID,
        status: 'accepted',
      })),
      listConnections: mock(() => Promise.resolve([])),
      sendMessage: mock(() => Promise.resolve({
        _id: 'msg12345678901234567890',
        connectionId: VALID_CONN_ID,
        senderId: VALID_USER_ID,
        receiverId: VALID_RECEIVER_ID,
        message: 'Chat messaging!',
      })),
      getChatHistory: mock(() => Promise.resolve([])),
      listNotifications: mock(() => Promise.resolve([])),
      markNotificationAsRead: mock(() => Promise.resolve({
        _id: 'notif12345678901234567890',
        isRead: true,
      })),
    };

    connectionController = new ConnectionController(mockConnectionService);
    mockRes = mockResponse();
  });

  describe('createConnection', () => {
    it('should successfully create connection request', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: { receiverId: VALID_RECEIVER_ID, message: 'Hello!' },
      } as unknown as Request;

      await connectionController.createConnection(req, mockRes);

      expect(mockConnectionService.createConnection).toHaveBeenCalledWith(VALID_USER_ID, VALID_RECEIVER_ID, 'Hello!');
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.success).toBe(true);
      expect(mockRes.body.data.status).toBe('pending');
    });

    it('should fail creation if receiver ID is not 24 characters', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: { receiverId: 'invalid-id' },
      } as unknown as Request;

      expect(connectionController.createConnection(req, mockRes)).rejects.toThrow(AppError);
    });
  });

  describe('respondToConnection', () => {
    it('should successfully respond to connection request', async () => {
      const req = {
        headers: { userId: VALID_RECEIVER_ID },
        params: { connectionId: VALID_CONN_ID },
        body: { action: 'accept' },
      } as unknown as Request;

      await connectionController.respondToConnection(req, mockRes);

      expect(mockConnectionService.respondToConnection).toHaveBeenCalledWith(VALID_CONN_ID, VALID_RECEIVER_ID, 'accept');
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.data.status).toBe('accepted');
    });
  });

  describe('sendMessage', () => {
    it('should successfully send a message', async () => {
      const req = {
        headers: { userId: VALID_USER_ID },
        body: { connectionId: VALID_CONN_ID, message: 'Chat messaging!' },
      } as unknown as Request;

      await connectionController.sendMessage(req, mockRes);

      expect(mockConnectionService.sendMessage).toHaveBeenCalledWith(VALID_USER_ID, VALID_CONN_ID, 'Chat messaging!');
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.data.message).toBe('Chat messaging!');
    });
  });
});
