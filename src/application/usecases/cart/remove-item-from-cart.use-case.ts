import { Result, ResultType } from '@domain/shared/result';
import { Cart } from '@domain/entities/order/cart.entity';
import { CartRepository } from '@application/repositories/cart.repository';
import { CartNotFoundError } from '@domain/errors/cart.errors';

export type RemoveItemFromCartOutput = { cart: Cart };

export class RemoveItemFromCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(cartId: string, dishId: string): Promise<ResultType<RemoveItemFromCartOutput, Error>> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) return Result.Failed(new CartNotFoundError(cartId));

    const updatedCart = cart.removeItem(dishId);
    await this.cartRepository.update(updatedCart);
    return Result.Success({ cart: updatedCart });
  }
}
