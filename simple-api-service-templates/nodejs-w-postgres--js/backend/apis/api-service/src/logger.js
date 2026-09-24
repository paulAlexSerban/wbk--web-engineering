import pino from 'pino';

const ERR_FIELDS_TO_OMIT = ['detail', 'where', 'internalQuery', 'hint'];

function omitErrFields(serialized) {
  if (!serialized || typeof serialized !== 'object') {
    return serialized;
  }
  for (const field of ERR_FIELDS_TO_OMIT) {
    delete serialized[field];
  }
  return serialized;
}

export function errSerializer(err) {
  return omitErrFields(pino.stdSerializers.err(err));
}

// pino-http runs the standard serializer first, then this one.
export function stripSerializedErr(serialized) {
  return omitErrFields(serialized);
}

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
  serializers: {
    err: errSerializer,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
