import { Result, ResultType } from '@domain/shared/result';
import { Cart } from '@domain/entities/order/cart.entity';
import { CartRepository } from '@application/repositories/cart.repository';

export type GetOrCreateCartOutput = { cart: Cart };

export class GetOrCreateCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(clientId: string): Promise<ResultType<GetOrCreateCartOutput, Error>> {
    const existing = await this.cartRepository.findActiveByClientId(clientId);
    if (existing) return Result.Success({ cart: existing });

    const cart = Cart.create({
      id: crypto.randomUUID(),
      clientId,
    });
    await this.cartRepository.create(cart);
    return Result.Success({ cart });
  }
}
