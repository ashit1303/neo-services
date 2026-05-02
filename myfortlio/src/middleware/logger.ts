import pinoHttp from 'pino-http';
import { logger } from './logger';

export const httpLogger = pinoHttp({
  logger: logger as any,
  genReqId: (req) => {
    const existingId = req.id ?? req.headers['x-request-id'];
    if (existingId) { return existingId; }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  autoLogging: {
    ignore: (req) => {
      const ignoredPaths = ['/health', '/metrics'];
      return ignoredPaths.includes(req.url || '');
    },
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    if (res.statusCode >= 300) {
      return 'info';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  serializers: {
    req: (req) => {
      const expressReq = req;
      return {
        id: expressReq.id,
        method: expressReq.method,
        url: expressReq.url,
        path: expressReq.path,
        headers: {
          host: expressReq.headers.host,
          'user-agent': expressReq.headers['user-agent'],
          'content-type': expressReq.headers['content-type'],
          'content-length': expressReq.headers['content-length'],
          origin: expressReq.headers.origin,
          referer: expressReq.headers.referer,
        },
        remoteAddress: expressReq.remoteAddress || expressReq.ip,
        remotePort: expressReq.remotePort,
      };
    },
    res: (res) => {
      const getHeader = (name: string) => {
        if (typeof res.getHeader === 'function') {
          return res.getHeader(name);
        }
        return undefined;
      };
      return {
        statusCode: res.statusCode,
        headers: {
          'content-type': getHeader('content-type'),
          'content-length': getHeader('content-length'),
        },
      };
    },
    err: (err) => ({
      type: err.type,
      message: err.message,
      stack: err.stack,
      ...(err.code && { code: err.code }),
      ...(err.statusCode && { statusCode: err.statusCode }),
    }),
  },
  redact: {
    paths: [
      'request.headers.authorization',
      'request.headers.cookie',
      'request.headers["x-api-key"]',
      'request.body.password',
      'request.body.token',
      'response.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
});

import pino from 'pino';

const isProduction = process.env.BUN_ENV === 'PROD';
const isDevelopment = ['LOCAL', 'DEV'].includes(process.env.BUN_ENV || '');

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  base: {
    env: process.env.BUN_ENV || 'DEV',
    service: process.env.SERVICE_NAME || 'myfortlio-service',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: ['password', 'token', 'authorization', 'cookie', 'apiKey', 'secret'],
    censor: '[REDACTED]',
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
        levelFirst: true,
      },
    },
  }),
});