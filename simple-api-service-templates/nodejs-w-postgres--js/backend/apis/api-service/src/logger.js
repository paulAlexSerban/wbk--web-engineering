import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    pid: process.pid,
    'service.name': process.env.SERVICE_NAME || 'api-service',
    'service.version': process.env.SERVICE_VERSION || '0.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  },
});
