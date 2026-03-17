import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPort, UserPayload } from '@application/ports/token.port';
import { ResultType, Result } from '@domain/shared/result';
import { UnauthorizedError } from '@domain/errors/auth.errors';
import { ConfigPort } from '@application/ports/config.port';

export class TokenService implements TokenPort {
  constructor(private readonly config: ConfigPort) {}

  generate(payload: UserPayload): string {
    const expiresIn = this.config.get('JWT_EXPIRES_IN') || '1h';

    return jwt.sign(
      payload,
      this.config.getOrThrow('JWT_SECRET'),
      { expiresIn } as SignOptions
    );
  }

  verify(token: string): ResultType<UserPayload, UnauthorizedError> {
    try {
      const payload = jwt.verify(
        token,
        this.config.getOrThrow('JWT_SECRET')
      );
      return Result.Success(payload as UserPayload);
    } catch {
      return Result.Failed(new UnauthorizedError('Invalid or expired token'));
    }
  }
}