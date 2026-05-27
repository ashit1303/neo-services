import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
// eslint-disable-next-line no-duplicate-imports
import type { NextFunction, Request, Response as ExpressResponse } from 'express';
// import express, { NextFunction, Request, Response } from 'express';
import router from './src/router/index.route';
import { bullMQService, mongoDbClient, mongooseClient } from './src/clients';
import { corsOptionsDelegate } from './src/core/core-utils/cors.util';
import { AppError } from './src/core/core-utils/err-util';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocs } from './src/swagger-docs/swagger.client';
import { WebSocketHandler, BunWS } from './src/core/core-clients/web-socket.client';
import { initializeBullMQTypesenseSync, scheduleTypesenseSync } from './src/core/core-workers/bullmq.workers';

const app = express();

app.use(express.json());

// Security headers configuration
app.use(helmet());
helmet.contentSecurityPolicy({
  useDefaults: true,
});
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.frameguard({ action: 'deny' }));

app.use(cors(corsOptionsDelegate));
app.options('*any', cors(corsOptionsDelegate));

// ... your app setup

if (process.env.BUN_ENV !== 'prod') {
  const docs = generateOpenApiDocs();
  // If using Express-like framework:
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(docs));
}

// Routes initialization
app.use(router);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 4020;
app.listen(PORT, async () => {
  try {
    await mongoDbClient.connect();
    await mongooseClient.connect();
    await initializeBullMQTypesenseSync().then(scheduleTypesenseSync);

    console.info(`🚀 Server ready at port ${PORT}`);
  } catch (error: any) {
    console.error('Error starting the server:', error);
  }
});

app.use((err: any, _req: Request, res: ExpressResponse, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err?.statusCode || 500).json({
      success: false,
      message: err?.userMessage || 'Internal Server Error',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    stackPath: err,
  });
});
const wsHandler = new WebSocketHandler({ message: async (_ws: BunWS, msg) => { console.info('message:', msg); } }, 1000);

const wsServer = Bun.serve<{ clientId: string }>({
  port: Number(PORT) + 1,
  fetch(req, server) {
    const upgraded = server.upgrade(req, { data: { clientId: crypto.randomUUID() } });
    if (upgraded) { console.info('🔌 WebSocket upgraded'); return; }
    return new Response('Not a websocket route', { status: 400 });
  },
  websocket: {
    open(ws: BunWS) { wsHandler.open(ws); },
    message(ws: BunWS, msg) { wsHandler.message(ws, msg); },
    close(ws: BunWS) { wsHandler.close(ws); },
  },
});

// close mongodb connection
process.on('SIGINT', async () => {
  await mongoDbClient.close();
  await mongooseClient.close();
  await bullMQService.close();
  await wsServer.stop(true);
  process.exit(0);
});

// BULL MQ TASKS

console.info(`🚀 WS Server running at ws://localhost:${wsServer.port}`);
// Websocket connection example
// wsHandler.sendToSubscribers('user_123', { from: 'user_456', message: 'hello', });
// wsHandler.sendToSubscribers('user_123', { from: 'user_456', message: 'hello', });
// { "action": "subscribe", "topic": "group_abc" }
// wsHandler.sendToSubscribers('group_abc', { from: 'user_1', message: 'hello group', });
// { "action": "subscribe", "topic": "global" } 
// wsHandler.sendToSubscribers('global', { message: 'system update', });