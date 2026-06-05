// import { ExportHelper } from './core/core-helper';
import { SecretManager } from './core/core-clients/secret-manager.client';
// import { ClickHouseClient } from '../core/clients/clickhouse.client';
import { MongoDBClient } from './core/core-clients/mongodb.client';
import { config } from '../config';
import { MongooseClient } from './core/core-clients/mongoose.client';
import { SESClientUtil } from './core/core-clients/aws-ses.client';
import { RedisService } from './core/core-clients/redis-service.client';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { BullMQService } from './core/core-clients/bullmq.client';
import { TypesenseService } from './core/core-clients/typesense-search.clients';
import { SessionManager } from './core/core-clients/session-manager.client';
import { OllamaClient } from './core/core-clients/ollama.client';
import { LMStudioClient } from './core/core-clients/lm-studio.client';
import { ILLMClient } from './interface/llm-client.interface';

import { SESHelper } from './core/core-helper/ses-helper';
import { OpenRouterClient } from './core/core-clients/open-router.client';

// export const clickHouseClient = new ClickHouseClient(config);
// export const downloadClient = new ExportHelper(config);
export const mongoDbClient = new MongoDBClient(config);
export const mongooseClient = new MongooseClient(config);
export const secretManager = new SecretManager(config);
export const sesClientUtil = new SESClientUtil(config);
export const sesHelper = new SESHelper(sesClientUtil);
export const redisClient = new RedisService(config);
export const openApiRegistry = new OpenAPIRegistry();
export const sensiSearch = new TypesenseService(config);
export const bullMQService = BullMQService.getInstance(config);
export const sessionManager = new SessionManager(redisClient, config);
export const ollamaClient = new OllamaClient(config);
export const lmStudioClient = new LMStudioClient(config);
export const openRouterClient = new OpenRouterClient(config);
export const backendBaseURL = process.env.BUN_ENV === 'local' ? 'http://localhost:4020' : 'https://testing-be.dev.argus.obenelectric.com';
export const frontendBaseURL = process.env.BUN_ENV === 'local' ? 'http://localhost:4010' : 'https://testing-fe.dev.argus.obenelectric.com';

const llmProvider = process.env.LLM_PROVIDER || 'openRouter';
export const llmClient: ILLMClient = llmProvider === 'openRouter' ? openRouterClient : ollamaClient;