import { Result, ResultType } from '@domain/shared/result';
import { Cart } from '@domain/entities/order/cart.entity';
import { CartRepository } from '@application/repositories/cart.repository';
import { CartNotFoundError } from '@domain/errors/cart.errors';

export type UpdateItemQuantityOutput = { cart: Cart };

export class UpdateItemQuantityUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(cartId: string, dishId: string, quantity: number): Promise<ResultType<UpdateItemQuantityOutput, Error>> {
    try {
      const cart = await this.cartRepository.findById(cartId);
      if (!cart) return Result.Failed(new CartNotFoundError(cartId));

      const updatedCart = cart.updateItemQuantity(dishId, quantity);
      await this.cartRepository.update(updatedCart);
      return Result.Success({ cart: updatedCart });
    } catch (error) {
      if (error instanceof CartNotFoundError) {
        return Result.Failed(error);
      }

      return Result.Failed(
        new Error(`Failed to update cart item quantity: ${(error as Error).message}`),
      );
    }
  }
}