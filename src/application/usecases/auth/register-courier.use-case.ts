import { User } from '@domain/entities/user/user.entity';
import { CourierProfile } from '@domain/entities/user/courier-profile.entity';
import { Email, InvalidEmailError } from '@domain/value-objects/email.value-object';
import { Result, ResultType } from '@domain/shared/result';
import { EmailAlreadyExistsError } from '@domain/errors/auth.errors';
import { UserRepository } from '@application/repositories/user.repository';
import { CourierProfileRepository } from '@application/repositories/courier-profile.repository';
import { HashPort } from '@application/ports/hash.port';
import { RegisterResponse } from '@application/usecases/auth/auth.types';
import { Phone } from '@domain/value-objects/phone.value-object';

export type RegisterCourierDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export class RegisterCourier {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly courierProfileRepository: CourierProfileRepository,
    private readonly hashPort: HashPort,
  ) {}

  async execute(inputCourier: RegisterCourierDto): Promise<ResultType<RegisterResponse, EmailAlreadyExistsError | InvalidEmailError>> {
    const emailResult = Email.create(inputCourier.email);
    const phoneResult = Phone.create(inputCourier.phone);
    if (!emailResult.success) return Result.Failed(emailResult.error);
    if (!phoneResult.success) return Result.Failed(phoneResult.error);
    const existing = await this.userRepository.findByEmail(emailResult.data);
    if (existing) return Result.Failed(new EmailAlreadyExistsError(inputCourier.email));

    const passwordHash = await this.hashPort.hash(inputCourier.password);

    const user = User.create({
      id: crypto.randomUUID(),
      email: emailResult.data,
      passwordHash,
      firstName: inputCourier.firstName,
      lastName: inputCourier.lastName,
      roles: ['COURIER'],
    });

    const profile = CourierProfile.create({
      id: crypto.randomUUID(),
      user,
      phone: phoneResult.data,
    });

    await this.userRepository.create(user);
    await this.courierProfileRepository.create(profile);

    return Result.Success({userId: user.id});
  }
}