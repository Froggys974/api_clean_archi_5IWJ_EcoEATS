import { User } from '@domain/entities/user/user.entity';
import { RestaurantOwnerProfile } from '@domain/entities/user/restaurant-owner-profile.entity';
import { Email, InvalidEmailError } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Result, ResultType } from '@domain/shared/result';
import { EmailAlreadyExistsError } from '@domain/errors/auth.errors';
import { UserRepository } from '@application/repositories/user.repository';
import { RestaurantOwnerProfileRepository } from '@application/repositories/restaurant-owner-profile.repository';
import { HashPort } from '@application/ports/hash.port';
import { RegisterResponse } from '@application/usecases/auth/auth.types';

export type RegisterRestaurantOwnerDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
};

export class RegisterRestaurantOwner {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly restaurantOwnerProfileRepository: RestaurantOwnerProfileRepository,
    private readonly hashPort: HashPort,
  ) {}

  async execute(input: RegisterRestaurantOwnerDto): Promise<ResultType<RegisterResponse, EmailAlreadyExistsError | InvalidEmailError>> {
    const emailResult = Email.create(input.email);
    if (!emailResult.success) return Result.Failed(emailResult.error);

    const phoneResult = Phone.create(input.phone);
    if (!phoneResult.success) return Result.Failed(phoneResult.error);

    const existing = await this.userRepository.findByEmail(emailResult.data);
    if (existing) return Result.Failed(new EmailAlreadyExistsError(input.email));

    const passwordHash = await this.hashPort.hash(input.password);

    const user = User.create({
      id: crypto.randomUUID(),
      email: emailResult.data,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      roles: ['RESTAURATEUR'],
    });

    const profile = RestaurantOwnerProfile.create({
      id: crypto.randomUUID(),
      user,
      phone: phoneResult.data,
    });

    await this.userRepository.create(user);
    await this.restaurantOwnerProfileRepository.create(profile);

    return Result.Success({ userId: user.id });
  }
}
