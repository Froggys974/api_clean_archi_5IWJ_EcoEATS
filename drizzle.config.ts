import type { Config } from 'drizzle-kit';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

export default {
  schema: './src/infrastructure/repositories/postgres/schema/users.schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: databaseUrl },
} satisfies Config;
