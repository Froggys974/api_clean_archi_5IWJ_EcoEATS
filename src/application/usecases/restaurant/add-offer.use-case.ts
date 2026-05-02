import { Result, ResultType } from '@domain/shared/result';
import { Offer } from '@domain/entities/marketing/offer.entity';
import { OfferRepository } from '@application/repositories/offer.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type AddOfferInput = {
  ownerId: string;
  label: string;
  discountPercent: number;
  imageUrl?: string;
};

export type AddOfferOutput = { offer: Offer };

export class AddOfferUseCase {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(input: AddOfferInput): Promise<ResultType<AddOfferOutput, Error>> {
    const restaurants = await this.restaurantRepository.findByOwnerId(input.ownerId);
    if (restaurants.length === 0) {
      return Result.Failed(new RestaurantNotFoundError(input.ownerId));
    }

    const restaurant = restaurants[0]!;
    const offerProps: Parameters<typeof Offer.create>[0] = {
      id: crypto.randomUUID(),
      restaurantId: restaurant.id,
      label: input.label,
      discountPercent: input.discountPercent,
    };
    if (input.imageUrl !== undefined) offerProps.imageUrl = input.imageUrl;

    const offer = Offer.create(offerProps);

    await this.offerRepository.create(offer);
    return Result.Success({ offer });
  }
}
