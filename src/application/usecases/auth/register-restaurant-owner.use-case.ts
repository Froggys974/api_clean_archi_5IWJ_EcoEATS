import { User } from '@domain/entities/user/user.entity';
import { RestaurantOwnerProfile } from '@domain/entities/user/restaurant-owner-profile.entity';
import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { Email, InvalidEmailError } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Address } from '@domain/value-objects/address.value-object';
import { Coordinates } from '@domain/value-objects/coordinates.value-object';
import { Result, ResultType } from '@domain/shared/result';
import { EmailAlreadyExistsError } from '@domain/errors/auth.errors';
import { UserRepository } from '@application/repositories/user.repository';
import { RestaurantOwnerProfileRepository } from '@application/repositories/restaurant-owner-profile.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
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
    private readonly restaurantRepository: RestaurantRepository,
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

    const coordinatesResult = Coordinates.create(48.8566, 2.3522);
    if (!coordinatesResult.success) return Result.Failed(new Error('Failed to create coordinates'));

    const addressResult = Address.create({
      street: input.restaurantAddress,
      city: input.restaurantCity,
      postalCode: '75000',
      country: 'France',
      coordinates: coordinatesResult.data,
    });
    if (!addressResult.success) return Result.Failed(addressResult.error);

    const restaurant = Restaurant.create({
      id: crypto.randomUUID(),
      ownerId: user.id,
      name: input.restaurantName,
      description: input.restaurantName,
      address: addressResult.data,
      phone: phoneResult.data,
      cuisineType: 'Cuisine',
      openingHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        openTime: '11:00',
        closeTime: '22:00',
      })),
      status: 'OPEN',
    });

    await this.userRepository.create(user);
    await this.restaurantOwnerProfileRepository.create(profile);
    await this.restaurantRepository.create(restaurant);

    return Result.Success({ userId: user.id });
  }
}
