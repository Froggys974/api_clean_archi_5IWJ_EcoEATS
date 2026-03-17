import { Email } from '@domain/value-objects/email.value-object';
import { Result, ResultType } from '@domain/shared/result';
import { InvalidCredentialsError } from '@domain/errors/auth.errors';
import { UserRepository } from '@application/repositories/user.repository';
import { HashPort } from '@application/ports/hash.port';
import { TokenPort, UserPayload } from '@application/ports/token.port';
import { LoginResponse } from '@application/usecases/auth/auth.types';

export type LoginDto = {
  email: string;
  password: string;
};

export class Login {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashPort: HashPort,
    private readonly tokenPort: TokenPort,
  ) {}

  async execute(inputUser: LoginDto): Promise<ResultType<LoginResponse, InvalidCredentialsError>> {
    const emailResult = Email.create(inputUser.email);
    if (!emailResult.success) return Result.Failed(new InvalidCredentialsError());

    const user = await this.userRepository.findByEmail(emailResult.data);
    if (!user) return Result.Failed(new InvalidCredentialsError());

    const isValid = await this.hashPort.compare(inputUser.password, user.passwordHash);
    if (!isValid) return Result.Failed(new InvalidCredentialsError());

    const payload: UserPayload = {
      id: user.id,
      roles: user.roles,
    };

    const token = this.tokenPort.generate(payload);

    return Result.Success({token});
  }
}