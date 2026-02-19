import { UserRole } from '@domain/entities/user/user.entity';
import { ResultType } from '@domain/shared/result';
import { UnauthorizedError } from '@domain/errors/auth.errors';

export type UserPayload = {
  id: string;
  roles: UserRole[];
};

export interface TokenPort {
  generate(payload: UserPayload): string;
  verify(token: string): ResultType<UserPayload, UnauthorizedError>;
}