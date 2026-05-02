import { Result, ResultType } from '@domain/shared/result';
import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';

export type ListRestaurantsOutput = { restaurants: Restaurant[] };

export class ListRestaurantsUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(): Promise<ResultType<ListRestaurantsOutput, Error>> {
    const restaurants = await this.restaurantRepository.findAll();
    return Result.Success({ restaurants });
  }
}
