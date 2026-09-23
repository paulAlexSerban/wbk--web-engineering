import pino from 'pino';

process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ??= process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317';
process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL ??= 'grpc';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME || 'api-service',
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
  },
  formatters: {
    level: (label) => {
      return {
        level: label,
      };
    },
  },
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
