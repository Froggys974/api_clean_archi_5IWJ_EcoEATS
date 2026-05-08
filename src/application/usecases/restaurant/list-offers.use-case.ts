import { Result, ResultType } from '@domain/shared/result';
import { Offer } from '@domain/entities/marketing/offer.entity';
import { OfferRepository } from '@application/repositories/offer.repository';

export type ListOffersOutput = { offers: Offer[] };

export class ListOffersUseCase {
  constructor(private readonly offerRepository: OfferRepository) {}

  async execute(): Promise<ResultType<ListOffersOutput, Error>> {
    const offers = await this.offerRepository.findAll();
    return Result.Success({ offers });
  }
}
