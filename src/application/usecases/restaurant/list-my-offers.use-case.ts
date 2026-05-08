import { Result, ResultType } from '@domain/shared/result';
import { Offer } from '@domain/entities/marketing/offer.entity';
import { OfferRepository } from '@application/repositories/offer.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type ListMyOffersOutput = { offers: Offer[] };

export class ListMyOffersUseCase {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(ownerId: string): Promise<ResultType<ListMyOffersOutput, Error>> {
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);
    if (restaurants.length === 0) {
      return Result.Failed(new RestaurantNotFoundError(ownerId));
    }

    const offers = await this.offerRepository.findByRestaurantId(restaurants[0]!.id);
    return Result.Success({ offers });
  }
}
