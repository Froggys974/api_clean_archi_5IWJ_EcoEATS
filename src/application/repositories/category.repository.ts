import { Category } from '@domain/entities/marketing/category.entity';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(category: Category): Promise<void>;
}
