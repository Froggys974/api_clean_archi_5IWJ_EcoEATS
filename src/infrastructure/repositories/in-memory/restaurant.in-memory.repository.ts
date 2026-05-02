import { Restaurant, RestaurantStatus } from '@domain/entities/restaurant/restaurant.entity';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';

export class RestaurantInMemoryRepository implements RestaurantRepository {
  private readonly restaurants = new Map<string, Restaurant>();

  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurants.get(id) ?? null;
  }

  async findByOwnerId(ownerId: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(r => r.ownerId === ownerId);
  }

  async findAll(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async findByStatus(status: RestaurantStatus): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(r => r.status === status);
  }

  async findByCuisineType(cuisineType: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(r => r.cuisineType === cuisineType);
  }

  async findNearby(_latitude: number, _longitude: number, _radiusKm: number): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async create(restaurant: Restaurant): Promise<void> {
    this.restaurants.set(restaurant.id, restaurant);
  }

  async update(restaurant: Restaurant): Promise<void> {
    if (!this.restaurants.has(restaurant.id)) return;
    this.restaurants.set(restaurant.id, restaurant);
  }

  async delete(id: string): Promise<void> {
    this.restaurants.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.restaurants.has(id);
  }
}
