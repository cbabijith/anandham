import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalDb = globalThis as unknown as { librarySql?: ReturnType<typeof postgres> };
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url)
    throw new Error('DATABASE_URL is required for the library. Run db:setup before starting.');
  return (globalDb.librarySql ??= postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 }));
}
export function getDb() {
  return drizzle(getSql(), { schema });
}
