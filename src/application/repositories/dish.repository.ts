import { Dish } from '@domain/entities/restaurant/dish.entity';

export interface DishRepository {
  findById(id: string): Promise<Dish | null>;
  findByRestaurantId(restaurantId: string): Promise<Dish[]>;
  findByCategory(restaurantId: string, category: string): Promise<Dish[]>;
  findAvailableByRestaurantId(restaurantId: string): Promise<Dish[]>;
  findAll(): Promise<Dish[]>;
  create(dish: Dish): Promise<void>;
  update(dish: Dish): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  bulkUpdate(dishes: Dish[]): Promise<void>;
}
