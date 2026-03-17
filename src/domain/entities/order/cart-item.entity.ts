import { Price } from '@domain/value-objects/price.value-object';
import { InvalidCartItemQuantityError } from '@domain/errors/cart.errors';

type CreateCartItemProps = {
  id: string;
  dishId: string;
  dishName: string;
  dishPrice: Price;
  quantity: number;
  specialInstructions?: string;
};

type UpdateCartItemProps = {
  quantity?: number;
  specialInstructions?: string;
};

export class CartItem {
  private constructor(
    public readonly id: string,
    public readonly dishId: string,
    public readonly dishName: string,
    public readonly dishPrice: Price,
    public readonly quantity: number,
    public readonly specialInstructions: string | undefined
  ) {
    this.validate();
  }

  static create(props: CreateCartItemProps): CartItem {
    return new CartItem(
      props.id,
      props.dishId,
      props.dishName,
      props.dishPrice,
      props.quantity,
      props.specialInstructions
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Cart item id is required');
    }

    if (!this.dishId || this.dishId.trim().length === 0) {
      throw new Error('Dish id is required');
    }

    if (!this.dishName || this.dishName.trim().length === 0) {
      throw new Error('Dish name is required');
    }

    if (this.quantity <= 0 || !Number.isInteger(this.quantity)) {
      throw new InvalidCartItemQuantityError(this.quantity);
    }
  }

  update(props: UpdateCartItemProps): CartItem {
    return new CartItem(
      this.id,
      this.dishId,
      this.dishName,
      this.dishPrice,
      props.quantity ?? this.quantity,
      props.specialInstructions ?? this.specialInstructions
    );
  }

  setQuantity(quantity: number): CartItem {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new InvalidCartItemQuantityError(quantity);
    }

    return new CartItem(
      this.id,
      this.dishId,
      this.dishName,
      this.dishPrice,
      quantity,
      this.specialInstructions
    );
  }

  increaseQuantity(amount: number = 1): CartItem {
    if (amount <= 0) {
      throw new Error('Amount to increase must be positive');
    }

    return this.setQuantity(this.quantity + amount);
  }

  decreaseQuantity(amount: number = 1): CartItem {
    if (amount <= 0) {
      throw new Error('Amount to decrease must be positive');
    }

    const newQuantity = this.quantity - amount;

    if (newQuantity < 1) {
      throw new Error('Quantity cannot be less than 1. Remove the item instead.');
    }

    return this.setQuantity(newQuantity);
  }

  getTotalPrice(): Price {
    const result = this.dishPrice.multiply(this.quantity);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  setSpecialInstructions(instructions: string | undefined): CartItem {
    return new CartItem(
      this.id,
      this.dishId,
      this.dishName,
      this.dishPrice,
      this.quantity,
      instructions
    );
  }
}
