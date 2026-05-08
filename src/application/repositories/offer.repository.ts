import { Offer } from '@domain/entities/marketing/offer.entity';

export interface OfferRepository {
  findAll(): Promise<Offer[]>;
  findById(id: string): Promise<Offer | null>;
  findByRestaurantId(restaurantId: string): Promise<Offer[]>;
  create(offer: Offer): Promise<void>;
}
