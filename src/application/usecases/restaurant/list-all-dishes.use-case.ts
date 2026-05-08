import { Result, ResultType } from '@domain/shared/result';
import { Dish } from '@domain/entities/restaurant/dish.entity';
import { DishRepository } from '@application/repositories/dish.repository';

export type ListAllDishesOutput = { dishes: Dish[] };

export class ListAllDishesUseCase {
  constructor(private readonly dishRepository: DishRepository) {}

  async execute(): Promise<ResultType<ListAllDishesOutput, Error>> {
    const dishes = await this.dishRepository.findAll();
    return Result.Success({ dishes });
  }
}
