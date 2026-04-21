import { RestaurantOwnerProfile } from '@domain/entities/user/restaurant-owner-profile.entity';
import { RestaurantOwnerProfileRepository } from '@application/repositories/restaurant-owner-profile.repository';

export class RestaurantOwnerProfileInMemoryRepository implements RestaurantOwnerProfileRepository {
  private readonly store = new Map<string, RestaurantOwnerProfile>();

  async findById(id: string): Promise<RestaurantOwnerProfile | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<RestaurantOwnerProfile | null> {
    return Array.from(this.store.values()).find(p => p.user.id === userId) ?? null;
  }

  async create(profile: RestaurantOwnerProfile): Promise<void> {
    this.store.set(profile.id, profile);
  }

  async update(profile: RestaurantOwnerProfile): Promise<void> {
    if (!this.store.has(profile.id)) return;
    this.store.set(profile.id, profile);
  }
}
