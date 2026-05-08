import { Dish } from '@domain/entities/restaurant/dish.entity';
import { DishRepository } from '@application/repositories/dish.repository';

export class DishInMemoryRepository implements DishRepository {
  private readonly dishes = new Map<string, Dish>();

  async findById(id: string): Promise<Dish | null> {
    return this.dishes.get(id) ?? null;
  }

  async findByRestaurantId(restaurantId: string): Promise<Dish[]> {
    return Array.from(this.dishes.values()).filter(d => d.restaurantId === restaurantId);
  }

  async findByCategory(restaurantId: string, category: string): Promise<Dish[]> {
    return Array.from(this.dishes.values()).filter(
      d => d.restaurantId === restaurantId && d.category === category,
    );
  }

  async findAvailableByRestaurantId(restaurantId: string): Promise<Dish[]> {
    return Array.from(this.dishes.values()).filter(
      d => d.restaurantId === restaurantId && d.isAvailable && d.availableStock > 0,
    );
  }

  async findAll(): Promise<Dish[]> {
    return Array.from(this.dishes.values());
  }

  async create(dish: Dish): Promise<void> {
    this.dishes.set(dish.id, dish);
  }

  async update(dish: Dish): Promise<void> {
    if (!this.dishes.has(dish.id)) return;
    this.dishes.set(dish.id, dish);
  }

  async delete(id: string): Promise<void> {
    this.dishes.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.dishes.has(id);
  }

  async bulkUpdate(dishes: Dish[]): Promise<void> {
    for (const dish of dishes) {
      this.dishes.set(dish.id, dish);
    }
  }
}
