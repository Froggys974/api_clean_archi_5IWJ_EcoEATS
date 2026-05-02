import { Result, ResultType } from '@domain/shared/result';
import { UnauthorizedError } from '@domain/errors/auth.errors';
import { TokenPort, UserPayload } from '@application/ports/token.port';
import { UserRole } from '@domain/entities/user/user.entity';

export class AuthGuard {
  constructor(private readonly tokenPort: TokenPort) {}

  verify(token: string | undefined, requiredRole: UserRole): ResultType<UserPayload, UnauthorizedError> {
    if (!token) return Result.Failed(new UnauthorizedError('No token provided'));

    const result = this.tokenPort.verify(token);
    if (!result.success) return Result.Failed(result.error);

    if (!result.data.roles.some(r => r.toLowerCase() === requiredRole.toLowerCase())) {
      return Result.Failed(new UnauthorizedError('Insufficient permissions'));
    }

    return Result.Success(result.data);
  }
}