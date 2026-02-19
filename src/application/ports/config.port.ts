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
}

export interface ConfigPort {
  get<K extends keyof Env>(key: K): Env[K];
  getOrThrow<K extends keyof Env>(key: K): Env[K];
}