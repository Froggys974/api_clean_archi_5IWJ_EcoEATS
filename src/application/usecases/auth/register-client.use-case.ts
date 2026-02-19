import { User } from '@domain/entities/user/user.entity';
import { ClientProfile } from '@domain/entities/user/client-profile.entity';
import { Email, InvalidEmailError } from '@domain/value-objects/email.value-object';
import { Result, ResultType } from '@domain/shared/result';
import { EmailAlreadyExistsError } from '@domain/errors/auth.errors';
import { UserRepository } from '@application/repositories/user.repository';
import { HashPort } from '@application/ports/hash.port';
import { ClientProfileRepository } from '@application/repositories/client-profile.repository';
import { RegisterResponse } from '@application/usecases/auth/auth.types';
import { Phone } from '@domain/value-objects/phone.value-object';

export type RegisterClientDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export class RegisterClient {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly clientProfileRepository: ClientProfileRepository,
    private readonly hashPort: HashPort,
  ) {}

  async execute(inputUser: RegisterClientDto): Promise<ResultType<RegisterResponse, EmailAlreadyExistsError | InvalidEmailError>> {
    const emailResult = Email.create(inputUser.email);
    const phoneResult = inputUser.phone ? Phone.create(inputUser.phone) : Result.Success(null);
    if (!emailResult.success) return Result.Failed(emailResult.error);
    if (!phoneResult.success) return Result.Failed(phoneResult.error);
    
    const existing = await this.userRepository.findByEmail(emailResult.data);
    if (existing) return Result.Failed(new EmailAlreadyExistsError(inputUser.email));

    const passwordHash = await this.hashPort.hash(inputUser.password);

    const user = User.create({
      id: crypto.randomUUID(),
      email: emailResult.data,
      passwordHash,
      firstName: inputUser.firstName,
      lastName: inputUser.lastName,
      roles: ['CLIENT'],
    });

    const profile = ClientProfile.create({
      id: crypto.randomUUID(),
      user,
      phone: phoneResult.data
    });

    await this.userRepository.create(user);
    await this.clientProfileRepository.create(profile);

    return Result.Success({userId: user.id});
  }
}