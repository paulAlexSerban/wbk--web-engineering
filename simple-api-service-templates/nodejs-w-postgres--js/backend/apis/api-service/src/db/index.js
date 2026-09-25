import { Pool } from 'pg';

import { logger } from '../logger.js';
import {
    POSTGRES_USER,
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
} from '../secrets/db_configuration.js';
import { instrumentPgPool, recordPgPoolError } from '../metrics.js';

if (!POSTGRES_USER || !POSTGRES_HOST || !POSTGRES_DB || !POSTGRES_PASSWORD || !POSTGRES_PORT) {
    throw new Error('Please provide all the necessary environment variables');
}

const poolConfig = {
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    password: POSTGRES_PASSWORD,
    port: parseInt(POSTGRES_PORT),
};

export const pool = new Pool(poolConfig);
instrumentPgPool(pool);

pool.on('error', (err) => {
  recordPgPoolError();
  logger.error({ err }, 'idle database client error');
});
