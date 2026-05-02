import { RestaurantOwnerProfile } from "@domain/entities/user/restaurant-owner-profile.entity";

export interface RestaurantOwnerProfileRepository {
  findById(id: string): Promise<RestaurantOwnerProfile | null>;
  findByUserId(userId: string): Promise<RestaurantOwnerProfile | null>;
  create(profile: RestaurantOwnerProfile): Promise<void>;
  update(profile: RestaurantOwnerProfile): Promise<void>;
}
