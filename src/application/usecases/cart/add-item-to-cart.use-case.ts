import { Result, ResultType } from "@domain/shared/result";
import { Cart } from "@domain/entities/order/cart.entity";
import { CartItem } from "@domain/entities/order/cart-item.entity";
import { Price } from "@domain/value-objects/price.value-object";
import { CartRepository } from "@application/repositories/cart.repository";
import { DishRepository } from "@application/repositories/dish.repository";
import {
  CartNotFoundError,
  DifferentRestaurantInCartError,
} from "@domain/errors/cart.errors";
import {
  DishNotFoundError,
  DishOutOfStockError,
  InsufficientStockError,
} from "@domain/errors/restaurant.errors";

export type AddItemToCartInput = {
  cartId: string;
  dishId: string;
  restaurantId: string;
  quantity: number;
  specialInstructions?: string;
};

export type AddItemToCartOutput = {
  cart: Cart;
  itemAdded: CartItem;
};

export class AddItemToCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  async execute(
    input: AddItemToCartInput,
  ): Promise<ResultType<AddItemToCartOutput, Error>> {
    try {
      const cart = await this.cartRepository.findById(input.cartId);
      if (!cart) {
        return Result.Failed(new CartNotFoundError(input.cartId));
      }

      const dish = await this.dishRepository.findById(input.dishId);
      if (!dish) {
        return Result.Failed(new DishNotFoundError(input.dishId));
      }

      if (!dish.isOrderable()) {
        return Result.Failed(new DishOutOfStockError(dish.name));
      }

      if (!dish.canFulfillQuantity(input.quantity)) {
        return Result.Failed(
          new InsufficientStockError(
            dish.name,
            input.quantity,
            dish.availableStock,
          ),
        );
      }

      const cartItemProps: {
        id: string;
        dishId: string;
        dishName: string;
        dishPrice: Price;
        quantity: number;
        dishImageUrl?: string;
        specialInstructions?: string;
      } = {
        id: crypto.randomUUID(),
        dishId: dish.id,
        dishName: dish.name,
        dishPrice: dish.price,
        quantity: input.quantity,
      };

      if (dish.imageUrl !== undefined) cartItemProps.dishImageUrl = dish.imageUrl;
      if (input.specialInstructions !== undefined) {
        cartItemProps.specialInstructions = input.specialInstructions;
      }

      const cartItem = CartItem.create(cartItemProps);

      const updatedCart = cart.addItem(cartItem, input.restaurantId);

      await this.cartRepository.update(updatedCart);

      return Result.Success({
        cart: updatedCart,
        itemAdded: cartItem,
      });
    } catch (error) {
      return Result.Failed(
        error instanceof Error ? error : new Error('Unexpected error adding item to cart'),
      );
    }
  }
}
