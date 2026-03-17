import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';

export interface RestaurantRepository {
  findById(id: string): Promise<Restaurant | null>;
  findByOwnerId(ownerId: string): Promise<Restaurant[]>;
  findAll(): Promise<Restaurant[]>;
  findByStatus(status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED'): Promise<Restaurant[]>;
  findByCuisineType(cuisineType: string): Promise<Restaurant[]>;
  findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Restaurant[]>;
  create(restaurant: Restaurant): Promise<void>;
  update(restaurant: Restaurant): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
