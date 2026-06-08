import { Router } from 'express';
import type { ConnectionController } from '../controller/connection.controller';
import type { AuthGuard } from '../middleware/auth.middleware';

export class ConnectionRoutes {
  public router: Router = Router();

  constructor(
    private connectionController: ConnectionController,
    private authGuard: AuthGuard,
  ) {
    this.initializeConnectionRoutes();
  }

  private initializeConnectionRoutes(): void {
    // Connections
    this.router.post('/connect', this.authGuard.checkAccess('createConnection'), this.connectionController.createConnection);
    this.router.post('/respond/:connectionId', this.authGuard.checkAccess('respondToConnection'), this.connectionController.respondToConnection);
    this.router.get('/list', this.authGuard.checkAccess('listConnections'), this.connectionController.listConnections);

    // Chat
    this.router.post('/chat/send', this.authGuard.checkAccess('sendMessage'), this.connectionController.sendMessage);
    this.router.get('/chat/history/:connectionId', this.authGuard.checkAccess('getChatHistory'), this.connectionController.getChatHistory);

    // Notifications
    this.router.get('/notifications', this.authGuard.checkAccess('listNotifications'), this.connectionController.listNotifications);
    this.router.post('/notifications/read/:notificationId', this.authGuard.checkAccess('markNotificationAsRead'), this.connectionController.markNotificationAsRead);
  }
}
