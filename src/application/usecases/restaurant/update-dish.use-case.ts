import { Result, ResultType } from '@domain/shared/result';
import { Dish } from '@domain/entities/restaurant/dish.entity';
import { Price } from '@domain/value-objects/price.value-object';
import { Allergen } from '@domain/value-objects/allergen.value-object';
import { DishRepository } from '@application/repositories/dish.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { DishNotFoundError, RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type UpdateDishInput = {
  dishId: string;
  ownerId: string;
  name?: string;
  description?: string;
  priceAmount?: number;
  allergens?: string[];
  dailyStock?: number;
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
};

export type UpdateDishOutput = { dish: Dish };

export class UpdateDishUseCase {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(input: UpdateDishInput): Promise<ResultType<UpdateDishOutput, Error>> {
    const dish = await this.dishRepository.findById(input.dishId);
    if (!dish) return Result.Failed(new DishNotFoundError(input.dishId));

    if (dish.restaurantId) {
      const restaurant = await this.restaurantRepository.findById(dish.restaurantId);
      if (!restaurant) return Result.Failed(new RestaurantNotFoundError(dish.restaurantId));
      if (!restaurant.belongsToOwner(input.ownerId)) {
        return Result.Failed(new Error('You do not own this restaurant'));
      }
    }

    let price: Price | undefined;
    if (input.priceAmount !== undefined) {
      const priceResult = Price.create(input.priceAmount);
      if (!priceResult.success) return Result.Failed(priceResult.error);
      price = priceResult.data;
    }

    let allergens: Allergen[] | undefined;
    if (input.allergens !== undefined) {
      allergens = [];
      for (const name of input.allergens) {
        const result = Allergen.create(name);
        if (!result.success) return Result.Failed(result.error);
        allergens.push(result.data);
      }
    }

    const updateProps: Parameters<typeof dish.update>[0] = {};
    if (input.name !== undefined) updateProps.name = input.name;
    if (input.description !== undefined) updateProps.description = input.description;
    if (price !== undefined) updateProps.price = price;
    if (allergens !== undefined) updateProps.allergens = allergens;
    if (input.imageUrl !== undefined) updateProps.imageUrl = input.imageUrl;
    if (input.category !== undefined) updateProps.category = input.category;
    if (input.isAvailable !== undefined) updateProps.isAvailable = input.isAvailable;
    let updatedDish = dish.update(updateProps);

    if (input.dailyStock !== undefined) {
      updatedDish = updatedDish.setDailyStock(input.dailyStock);
    }

    await this.dishRepository.update(updatedDish);
    return Result.Success({ dish: updatedDish });
  }
}
