import { Category } from '@domain/entities/marketing/category.entity';
import { CategoryRepository } from '@application/repositories/category.repository';

export class CategoryInMemoryRepository implements CategoryRepository {
  private readonly categories = new Map<string, Category>();

  async findAll(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) ?? null;
  }

  async create(category: Category): Promise<void> {
    this.categories.set(category.id, category);
  }
}
