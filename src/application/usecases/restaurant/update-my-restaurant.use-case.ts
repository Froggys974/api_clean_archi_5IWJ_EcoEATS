import { Result, ResultType } from '@domain/shared/result';
import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type UpdateMyRestaurantInput = {
  ownerId: string;
  name?: string;
  description?: string;
  cuisineType?: string;
  imageUrl?: string;
  openingHours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>;
  status?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';
};

export type UpdateMyRestaurantOutput = { restaurant: Restaurant };

export class UpdateMyRestaurantUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(input: UpdateMyRestaurantInput): Promise<ResultType<UpdateMyRestaurantOutput, Error>> {
    const restaurants = await this.restaurantRepository.findByOwnerId(input.ownerId);
    if (restaurants.length === 0) {
      return Result.Failed(new RestaurantNotFoundError(input.ownerId));
    }

    const restaurant = restaurants[0]!;

    const updateProps: Parameters<typeof restaurant.update>[0] = {};
    if (input.name !== undefined) updateProps.name = input.name;
    if (input.description !== undefined) updateProps.description = input.description;
    if (input.cuisineType !== undefined) updateProps.cuisineType = input.cuisineType;
    if (input.imageUrl !== undefined) updateProps.imageUrl = input.imageUrl;
    if (input.openingHours !== undefined) updateProps.openingHours = input.openingHours;

    let updated = restaurant.update(updateProps);

    if (input.status) {
      updated = updated.setStatus(input.status);
    }

    await this.restaurantRepository.update(updated);
    return Result.Success({ restaurant: updated });
  }
}
