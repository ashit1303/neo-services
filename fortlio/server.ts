import cors from 'cors';
import helmet from 'helmet';
import express, { NextFunction, Request, Response } from 'express';
import router from './src/router/index.route';
import { mongoDbClient, mongooseClient } from './src/clients';
import { corsOptionsDelegate } from './src/core/core-utils/cors.util';
import { AppError } from './src/core/core-utils/err-util';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocs } from './src/swagger-docs/swagger.client';

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

    console.info(`🚀 Server ready at port ${PORT}`);
  } catch (error: any) {
    console.error('Error starting the server:', error);
  }
});

// close mongodb connection
process.on('SIGINT', async () => {
  await mongoDbClient.close();
  await mongooseClient.close();
  process.exit(0);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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