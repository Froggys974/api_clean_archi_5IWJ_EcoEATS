import * as dotenv from 'dotenv';
import { Env, ConfigPort } from '@application/ports/config.port';

dotenv.config();

export class DotenvConfigService implements ConfigPort {
  get<K extends keyof Env>(key: K): Env[K] {
    return process.env[key as string] as Env[K];
  }

  getOrThrow<K extends keyof Env>(key: K): Env[K] {
    const value = process.env[key as string];
    if (!value) throw new Error(`Missing environment variable: ${String(key)}`);
    return value as Env[K];
  }
}