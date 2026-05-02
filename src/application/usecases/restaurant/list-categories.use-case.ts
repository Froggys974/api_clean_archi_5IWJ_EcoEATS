import { Result, ResultType } from '@domain/shared/result';
import { Category } from '@domain/entities/marketing/category.entity';
import { CategoryRepository } from '@application/repositories/category.repository';

export type ListCategoriesOutput = { categories: Category[] };

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<ResultType<ListCategoriesOutput, Error>> {
    const categories = await this.categoryRepository.findAll();
    return Result.Success({ categories });
  }
}
