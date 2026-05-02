import { Result, ResultType } from '@domain/shared/result';
import { Cart } from '@domain/entities/order/cart.entity';
import { CartRepository } from '@application/repositories/cart.repository';
import { CartNotFoundError } from '@domain/errors/cart.errors';

export type ClearCartOutput = { cart: Cart };

export class ClearCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(cartId: string): Promise<ResultType<ClearCartOutput, Error>> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) return Result.Failed(new CartNotFoundError(cartId));

    const cleared = cart.clear();
    await this.cartRepository.update(cleared);
    return Result.Success({ cart: cleared });
  }
}
