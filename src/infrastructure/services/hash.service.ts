import bcrypt from 'bcrypt';
import { HashPort } from '@application/ports/hash.port';
import { ConfigPort } from '@application/ports/config.port';

export class HashService implements HashPort {
  constructor(private readonly config: ConfigPort) {}

  async hash(plain: string): Promise<string> {
    const saltRounds = parseInt(this.config.get('BCRYPT_SALT_ROUNDS')) || 12;
    return bcrypt.hash(plain, saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}