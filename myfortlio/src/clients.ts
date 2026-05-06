// import { ExportHelper } from './core/core-helper';
import { SecretManager } from './core/core-clients/secret-manager.client';
// import { ClickHouseClient } from '../core/clients/clickhouse.client';
import { MongoDBClient } from './core/core-clients/mongodb.client';
import { config } from '../config';
import { MongooseClient } from './core/core-clients/mongoose.client';
import { SESClientUtil } from './core/core-clients/aws-ses.client';
import { RedisService } from './core/core-clients/redis-service.client';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

// export const clickHouseClient = new ClickHouseClient(config);
// export const downloadClient = new ExportHelper(config);
export const mongoDbClient = new MongoDBClient(config);
export const mongooseClient = new MongooseClient(config);
export const secretManger = new SecretManager(config);
export const sesClientUtil = new SESClientUtil(config);
export const redisClient = new RedisService(config);
export const openApiRegistry = new OpenAPIRegistry();