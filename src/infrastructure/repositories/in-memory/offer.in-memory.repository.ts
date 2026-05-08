import { Offer } from '@domain/entities/marketing/offer.entity';
import { OfferRepository } from '@application/repositories/offer.repository';

export class OfferInMemoryRepository implements OfferRepository {
  private readonly offers = new Map<string, Offer>();

  async findAll(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async findById(id: string): Promise<Offer | null> {
    return this.offers.get(id) ?? null;
  }

  async findByRestaurantId(restaurantId: string): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(o => o.restaurantId === restaurantId);
  }

  async create(offer: Offer): Promise<void> {
    this.offers.set(offer.id, offer);
  }
}
