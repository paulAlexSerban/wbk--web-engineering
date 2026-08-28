import { Pool } from 'pg';

import {
    POSTGRES_USER,
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
} from '../secrets/db_configuration';

type PoolConfig = {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
};

if (!POSTGRES_USER || !POSTGRES_HOST || !POSTGRES_DB || !POSTGRES_PASSWORD || !POSTGRES_PORT) {
    throw new Error('Please provide all the necessary environment variables');
}

const poolConfig: PoolConfig = {
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    password: POSTGRES_PASSWORD,
    port: parseInt(POSTGRES_PORT),
};

export const pool = new Pool(poolConfig);
