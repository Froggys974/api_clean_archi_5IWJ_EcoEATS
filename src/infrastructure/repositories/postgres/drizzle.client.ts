import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/users.schema';

export type DrizzleClient = ReturnType<typeof createDrizzleClient>;

export function createDrizzleClient(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}
