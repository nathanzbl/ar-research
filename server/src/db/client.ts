import pg, { QueryResultRow } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/emmalee-trumenu-ar';
    const isRemote = !connectionString.includes('localhost');

    const sslConfig = (() => {
      if (!isRemote) return undefined;
      const certPath = join(homedir(), 'rds-certs', 'rds-ca-2019-root.pem');
      if (existsSync(certPath)) {
        return { ca: readFileSync(certPath, 'utf-8'), rejectUnauthorized: true };
      }
      return { rejectUnauthorized: false };
    })();

    _pool = new Pool({
      connectionString,
      ...(sslConfig ? { ssl: sslConfig } : {}),
    });

    console.log(`Database: ${isRemote ? 'AWS RDS' : 'localhost'}`);
  }
  return _pool;
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    return (getPool() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function initDatabase() {
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    await getPool().query(schema);
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}
