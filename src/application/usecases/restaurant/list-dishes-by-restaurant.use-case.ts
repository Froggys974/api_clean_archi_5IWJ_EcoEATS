import { Result, ResultType } from '@domain/shared/result';
import { Dish } from '@domain/entities/restaurant/dish.entity';
import { DishRepository } from '@application/repositories/dish.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type ListDishesByRestaurantOutput = { dishes: Dish[] };

export class ListDishesByRestaurantUseCase {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(restaurantId: string): Promise<ResultType<ListDishesByRestaurantOutput, Error>> {
    const exists = await this.restaurantRepository.exists(restaurantId);
    if (!exists) return Result.Failed(new RestaurantNotFoundError(restaurantId));

    const dishes = await this.dishRepository.findByRestaurantId(restaurantId);
    return Result.Success({ dishes });
  }
}
