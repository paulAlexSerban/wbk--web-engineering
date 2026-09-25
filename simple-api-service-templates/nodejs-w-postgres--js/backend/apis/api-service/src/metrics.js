import client from '@prometheus-io/client';

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

const HTTP_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];
const QUERY_BUCKETS = [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5];
const SKIP_PATHS = new Set(['/metrics', '/health', '/health/']);

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds, excluding /health and /metrics',
  labelNames: ['method', 'route'],
  buckets: HTTP_BUCKETS,
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'HTTP requests, excluding /health and /metrics',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'HTTP requests currently being served, excluding /health and /metrics',
  registers: [register],
});

const pgPoolConnections = new client.Gauge({
  name: 'pg_pool_connections',
  help: 'PostgreSQL pool connections by state',
  labelNames: ['host', 'database', 'state'],
  registers: [register],
});

const pgPoolMaxConnections = new client.Gauge({
  name: 'pg_pool_max_connections',
  help: 'Configured maximum size of the PostgreSQL pool',
  labelNames: ['host', 'database'],
  registers: [register],
});

const pgPoolErrorsTotal = new client.Counter({
  name: 'pg_pool_errors_total',
  help: 'Idle PostgreSQL client errors',
  registers: [register],
});

const pgQueryDuration = new client.Histogram({
  name: 'pg_query_duration_seconds',
  help: 'PostgreSQL query duration in seconds',
  buckets: QUERY_BUCKETS,
  registers: [register],
});

const pgQueryErrorsTotal = new client.Counter({
  name: 'pg_query_errors_total',
  help: 'PostgreSQL queries that threw',
  registers: [register],
});

export const httpMetrics = (routeTemplate) => (req, res, next) => {
  if (SKIP_PATHS.has(req.path)) {
    next();
    return;
  }

  httpRequestsInFlight.inc();
  const end = httpRequestDuration.startTimer();
  let recorded = false;

  const record = () => {
    if (recorded) return;
    recorded = true;
    httpRequestsInFlight.dec();
    const labels = {
      method: req.method,
      route: routeTemplate(req) || 'unknown',
    };
    end(labels);
    httpRequestsTotal.inc({
      ...labels,
      status_code: String(res.statusCode),
    });
  };

  res.on('finish', record);
  res.on('close', record);
  next();
};

export const instrumentPgPool = (pool) => {
  const labels = {
    host: pool.options.host,
    database: pool.options.database,
  };
  const max = pool.options.max ?? 10;

  const sample = () => {
    pgPoolConnections.set({ ...labels, state: 'total' }, pool.totalCount);
    pgPoolConnections.set({ ...labels, state: 'idle' }, pool.idleCount);
    pgPoolConnections.set({ ...labels, state: 'waiting' }, pool.waitingCount);
    pgPoolMaxConnections.set(labels, max);
  };

  sample();
  setInterval(sample, 5000).unref();

  const query = pool.query.bind(pool);
  pool.query = function instrumentedQuery(...args) {
    if (typeof args[args.length - 1] === 'function') {
      return query(...args);
    }

    const stop = pgQueryDuration.startTimer();
    return Promise.resolve(query(...args)).then(
      (result) => {
        stop();
        return result;
      },
      (err) => {
        stop();
        pgQueryErrorsTotal.inc();
        throw err;
      },
    );
  };
};

export const recordPgPoolError = () => {
  pgPoolErrorsTotal.inc();
};
