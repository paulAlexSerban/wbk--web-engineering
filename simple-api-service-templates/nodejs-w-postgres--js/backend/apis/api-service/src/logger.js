import pino from 'pino';

// pino-opentelemetry-transport (v2) does not accept the collector endpoint/protocol
// as programmatic options - it only reads them from these env vars, which must be
// set before the transport worker thread is spawned below.
process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ??= process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317';
process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL ??= 'grpc';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:{
    target: 'pino-opentelemetry-transport',
    options: {
      resourceAttributes: {
        pid: process.pid,
        'service.name': process.env.SERVICE_NAME || 'api-service',
        'service.version': process.env.SERVICE_VERSION || '0.0.0',
        'deployment.environment': process.env.NODE_ENV || 'development',
      },
    }
  },
  base: {
    pid: process.pid,
    'service.name': process.env.SERVICE_NAME || 'api-service',
    'service.version': process.env.SERVICE_VERSION || '0.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  },
});
