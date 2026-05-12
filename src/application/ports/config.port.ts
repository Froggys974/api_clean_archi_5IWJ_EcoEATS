export enum NodeEnv {
  dev = 'development',
  prod = 'production',
}

export interface Env {
  NODE_ENV: NodeEnv;
  PORT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: string;
  FRONTEND_URL?: string;
  // DB_ADAPTER=in-memory | postgres (auth)
  DB_ADAPTER?: string;
  // Required when DB_ADAPTER=postgres (pareil, auth)
  DATABASE_URL?: string;
  NEST_PORT?: string;

}

export interface ConfigPort {
  get<K extends keyof Env>(key: K): Env[K];
  getOrThrow<K extends keyof Env>(key: K): NonNullable<Env[K]>;
}
