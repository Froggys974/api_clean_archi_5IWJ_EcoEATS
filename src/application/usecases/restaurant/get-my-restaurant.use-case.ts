import { Result, ResultType } from '@domain/shared/result';
import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type GetMyRestaurantOutput = { restaurant: Restaurant };

export class GetMyRestaurantUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(ownerId: string): Promise<ResultType<GetMyRestaurantOutput, Error>> {
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);
    if (restaurants.length === 0) return Result.Failed(new RestaurantNotFoundError(ownerId));
    return Result.Success({ restaurant: restaurants[0]! });
  }
}
