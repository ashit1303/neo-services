import { openApiRegistry } from '../clients';
import { z } from '../validations/zod';
import { IdValidation } from '../validations/common-validation';

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

export function registerConnectionRoutes() {
  // Connections
  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Connections'],
    path: '/connections/connect',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: CreateConnectionValidation } } } },
    responses: { 200: { description: 'Connection request created' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Connections'],
    path: '/connections/respond/{connectionId}',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: RespondConnectionValidation } } } },
    responses: { 200: { description: 'Connection request responded to' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Connections'],
    path: '/connections/list',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'List of connections' } },
  });

  // Chat
  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Connections/Chat'],
    path: '/connections/chat/send',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: SendMessageValidation } } } },
    responses: { 200: { description: 'Chat message sent successfully' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Connections/Chat'],
    path: '/connections/chat/history/{connectionId}',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Chat history fetched successfully' } },
  });

  // Notifications
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Connections/Notifications'],
    path: '/connections/notifications',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'List of user notifications' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Connections/Notifications'],
    path: '/connections/notifications/read/{notificationId}',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Notification marked as read' } },
  });
}
