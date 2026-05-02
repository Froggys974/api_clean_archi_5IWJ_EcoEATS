import { Result, ResultType } from '@domain/shared/result';
import { DishRepository } from '@application/repositories/dish.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { DishNotFoundError, RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type DeleteDishOutput = { message: string };

export class DeleteDishUseCase {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(dishId: string, ownerId: string): Promise<ResultType<DeleteDishOutput, Error>> {
    const dish = await this.dishRepository.findById(dishId);
    if (!dish) return Result.Failed(new DishNotFoundError(dishId));

    if (dish.restaurantId) {
      const restaurant = await this.restaurantRepository.findById(dish.restaurantId);
      if (!restaurant) return Result.Failed(new RestaurantNotFoundError(dish.restaurantId));
      if (!restaurant.belongsToOwner(ownerId)) {
        return Result.Failed(new Error('You do not own this restaurant'));
      }
    }

    await this.dishRepository.delete(dishId);
    return Result.Success({ message: 'Dish deleted successfully' });
  }
}
