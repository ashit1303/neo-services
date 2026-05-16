import { Server, WebSocket } from 'ws';
import { generateUUID } from '../core-utils';
import { AppError } from '../core-utils/err-util';

export class WebSocketHandler<T extends { action: string; topic?: string }> {
  private wss: Server;
  private actionHandlers: Record<string, (ws: WebSocket, message: T) => Promise<void>>;
  private connectedClients: Map<string, WebSocket>;
  private subscriptions: Map<string, Set<string>>; // clientId -> subscribed topics
  private rateLimitMap: Map<string, number>;
  private RATE_LIMIT_INTERVAL: number;

  constructor(
    wss: Server,
    actionHandlers: Record<string, (ws: WebSocket, message: T) => Promise<void>>,
    RATE_LIMIT_INTERVAL: number,
  ) {
    this.wss = wss;
    this.actionHandlers = actionHandlers;
    this.connectedClients = new Map();
    this.subscriptions = new Map();
    this.rateLimitMap = new Map();
    this.RATE_LIMIT_INTERVAL = RATE_LIMIT_INTERVAL;

    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = generateUUID();
      this.connectedClients.set(clientId, ws);
      console.info(`WebSocket client connected: ${clientId}`);

      ws.on('message', async (message: string) => {
        try {
          if (!this.rateLimiter(clientId)) {
            ws.send(JSON.stringify({ status: 'error', message: 'Rate limit exceeded' }));
            return;
          }

          const parsedMessage = this.validateMessage<T>(message);

          if (parsedMessage.action === 'subscribe') {
            if (!parsedMessage.topic) {
              ws.send(JSON.stringify({ status: 'error', message: 'Topic is required for subscription' }));
              return;
            }

            const topics = this.subscriptions.get(clientId) || new Set();

            topics.add(parsedMessage.topic);
            this.subscriptions.set(clientId, topics);

            ws.send(JSON.stringify({ status: 'success', message: `Subscribed to ${parsedMessage.topic}` }));
            return;
          }

          if (parsedMessage.action === 'unsubscribe') {
            const topics = this.subscriptions.get(clientId);

            if (topics && parsedMessage.topic) {
              topics.delete(parsedMessage.topic);
              ws.send(JSON.stringify({ status: 'success', message: `Unsubscribed from ${parsedMessage.topic}` }));
            }

            return;
          }

          // Custom action handler
          const handler = this.actionHandlers[parsedMessage.action];
          if (handler) {
            const socket = this.connectedClients.get(clientId);
            if (socket) {
              await handler(socket, parsedMessage);
            }
          } else {
            ws.send(JSON.stringify({ status: 'error', message: `Unknown action: ${parsedMessage.action}` }));
          }
        } catch (error: any) {
          this.handleError(ws, error);
        }
      });

      ws.on('close', () => {
        console.info(`WebSocket client disconnected: ${clientId}`);
        this.connectedClients.delete(clientId);
        this.subscriptions.delete(clientId);
      });
    });
  }

  private rateLimiter(clientId: string): boolean {
    const now = Date.now();
    const lastRequestTime = this.rateLimitMap.get(clientId) || 0;
    if (now - lastRequestTime < this.RATE_LIMIT_INTERVAL) { return false; }
    this.rateLimitMap.set(clientId, now);
    return true;
  }

  private validateMessage<Q extends { action: string }>(message: string): Q {
    try {
      const parsedMessage = JSON.parse(message);
      if (!parsedMessage.action) {
        throw new AppError('Action is required in the message', { msg: 'Action is required in the message', apiName: 'validateMessage', debugValues: { message } });
      }
      return parsedMessage;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Invalid message format', apiName: 'validateMessage', debugValues: { message } });
    }
  }

  private handleError(ws: WebSocket, error: unknown): void {
    console.error('WebSocket error:', error);
    ws.send(JSON.stringify({ status: 'error', message: (error as Error).message }));
  }

  public sendToSubscribers(topic: string, payload: unknown): void {
    for (const [clientId, topics] of this.subscriptions.entries()) {
      if (topics.has(topic)) {
        const ws = this.connectedClients.get(clientId);

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      }
    }
  }

  public getClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
