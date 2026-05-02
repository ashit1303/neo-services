import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import router from './src/router/index.route';
import { mongoDbClient, mongooseClient } from './src/clients';
import { corsOptionsDelegate } from './src/core/core-utils/cors.util';

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
app.options('*', cors(corsOptionsDelegate));

// Routes initialization
app.use('/service', router);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 4160;
app.listen(PORT, async () => {
  try {
    await mongoDbClient.connect();
    await mongooseClient.connect();

    console.info(`🚀 Server ready at port ${PORT}`);
  } catch (error) {
    console.error('Error starting the server:', error);
  }
});

// close mongodb connection
process.on('SIGINT', async () => {
  await mongoDbClient.close();
  await mongooseClient.close();
  process.exit(0);
});