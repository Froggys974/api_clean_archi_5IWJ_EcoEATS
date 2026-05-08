import { Result, ResultType } from '@domain/shared/result';
import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type GetRestaurantByIdOutput = { restaurant: Restaurant };

export class GetRestaurantByIdUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(id: string): Promise<ResultType<GetRestaurantByIdOutput, Error>> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) return Result.Failed(new RestaurantNotFoundError(id));
    return Result.Success({ restaurant });
  }
}
