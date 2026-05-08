import { Result, ResultType } from '@domain/shared/result';
import { Dish } from '@domain/entities/restaurant/dish.entity';
import { Price } from '@domain/value-objects/price.value-object';
import { Allergen } from '@domain/value-objects/allergen.value-object';
import { DishRepository } from '@application/repositories/dish.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type AddDishInput = {
  restaurantId: string;
  ownerId: string;
  name: string;
  description: string;
  priceAmount: number;
  allergens?: string[];
  dailyStock: number;
  imageUrl?: string;
  category?: string;
};

export type AddDishOutput = { dish: Dish };

export class AddDishUseCase {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(input: AddDishInput): Promise<ResultType<AddDishOutput, Error>> {
    const restaurant = await this.restaurantRepository.findById(input.restaurantId);
    if (!restaurant) return Result.Failed(new RestaurantNotFoundError(input.restaurantId));

    if (!restaurant.belongsToOwner(input.ownerId)) {
      return Result.Failed(new Error('You do not own this restaurant'));
    }

    const priceResult = Price.create(input.priceAmount);
    if (!priceResult.success) return Result.Failed(priceResult.error);

    const allergens: Allergen[] = [];
    for (const name of input.allergens ?? []) {
      const result = Allergen.create(name);
      if (!result.success) return Result.Failed(result.error);
      allergens.push(result.data);
    }

    const dishProps: Parameters<typeof Dish.create>[0] = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      price: priceResult.data,
      allergens,
      dailyStock: input.dailyStock,
      restaurantId: input.restaurantId,
    };
    if (input.imageUrl !== undefined) dishProps.imageUrl = input.imageUrl;
    if (input.category !== undefined) dishProps.category = input.category;
    const dish = Dish.create(dishProps);

    await this.dishRepository.create(dish);
    return Result.Success({ dish });
  }
}
