import { ServerWebSocket } from 'bun';
import { generateUUID } from '../core-utils';
import { AppError } from '../core-utils/err-util';

export type BunWS = ServerWebSocket<{ clientId: string }>;

export class WebSocketHandler<T extends { action: string; topic?: string }> {
  private actionHandlers: Record<string, (ws: BunWS, message: T) => Promise<void>>;
  private connectedClients: Map<string, BunWS>;
  private subscriptions: Map<string, Set<string>>;
  private rateLimitMap: Map<string, number>;
  private RATE_LIMIT_INTERVAL: number;

  constructor(
    actionHandlers: Record<string, (ws: BunWS, message: T) => Promise<void>>,
    RATE_LIMIT_INTERVAL: number,
  ) {
    this.actionHandlers = actionHandlers;
    this.connectedClients = new Map();
    this.subscriptions = new Map();
    this.rateLimitMap = new Map();
    this.RATE_LIMIT_INTERVAL = RATE_LIMIT_INTERVAL;
  }

  public open(ws: BunWS): void {
    const clientId = generateUUID();
    ws.data = { clientId };
    this.connectedClients.set(clientId, ws);
  }

  public async message(ws: BunWS, message: string | Buffer): Promise<void> {
    const clientId = ws.data.clientId;
    try {
      if (!this.rateLimiter(clientId)) {
        ws.send(JSON.stringify({ status: 'error', message: 'Rate limit exceeded' }));
        return;
      }

      const parsed = this.validateMessage<T>(message.toString());

      if (parsed.action === 'subscribe') {
        if (!parsed.topic) {
          ws.send(JSON.stringify({ status: 'error', message: 'Topic required' }));
          return;
        }

        const topics = this.subscriptions.get(clientId) || new Set();
        topics.add(parsed.topic);
        this.subscriptions.set(clientId, topics);

        ws.send(JSON.stringify({ status: 'success', message: `Subscribed to ${parsed.topic}` }));
        return;
      }

      if (parsed.action === 'unsubscribe') {
        this.subscriptions.get(clientId)?.delete(parsed.topic!);
        ws.send(JSON.stringify({ status: 'success', message: `Unsubscribed from ${parsed.topic}` }));
        return;
      }

      const handler = this.actionHandlers[parsed.action];
      if (handler) { await handler(ws, parsed); }
      else { ws.send(JSON.stringify({ status: 'error', message: `Unknown action: ${parsed.action}` })); }
    } catch (e: any) {
      this.handleError(ws, e);
    }
  }

  public close(ws: BunWS): void {
    const clientId = ws.data.clientId;
    this.connectedClients.delete(clientId);
    this.subscriptions.delete(clientId);
    this.rateLimitMap.delete(clientId);
  }

  private rateLimiter(clientId: string): boolean {
    const now = Date.now();
    const last = this.rateLimitMap.get(clientId) || 0;
    if (now - last < this.RATE_LIMIT_INTERVAL) { return false; }
    this.rateLimitMap.set(clientId, now);
    return true;
  }

  private validateMessage<Q extends { action: string }>(message: string): Q {
    try {
      const parsed = JSON.parse(message);
      if (!parsed.action) { throw new AppError('Action required', { msg: 'Action required', apiName: 'validateMessage' }); }
      return parsed;
    } catch (e: any) {
      throw new AppError(e.message || 'unknown', { msg: 'Invalid message', apiName: 'validateMessage' });
    }
  }

  private handleError(ws: BunWS, error: unknown): void {
    ws.send(JSON.stringify({ status: 'error', message: (error as Error).message }));
  }

  public sendToSubscribers(topic: string, payload: unknown): void {
    for (const [id, topics] of this.subscriptions.entries()) {
      if (topics.has(topic)) {
        const ws = this.connectedClients.get(id);
        if (ws) { ws.send(JSON.stringify(payload)); }
      }
    }
  }

  public getClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}