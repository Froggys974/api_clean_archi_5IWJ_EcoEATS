import { Price } from "@domain/value-objects/price.value-object";
import { InvalidOrderItemFieldError, InvalidOrderItemQuantityError } from "@domain/errors/order.errors";

type CreateOrderItemProps = {
  id: string;
  dishId: string;
  dishName: string;
  dishPrice: Price;
  quantity: number;
  specialInstructions?: string;
};

export class OrderItem {
  private constructor(
    public readonly id: string,
    public readonly dishId: string,
    public readonly dishName: string,
    public readonly dishPrice: Price,
    public readonly quantity: number,
    public readonly specialInstructions: string | undefined,
  ) {
    this.validate();
  }

  static create(props: CreateOrderItemProps): OrderItem {
    return new OrderItem(
      props.id,
      props.dishId,
      props.dishName,
      props.dishPrice,
      props.quantity,
      props.specialInstructions,
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new InvalidOrderItemFieldError('id');
    }

    if (!this.dishId || this.dishId.trim().length === 0) {
      throw new InvalidOrderItemFieldError('dish id');
    }

    if (!this.dishName || this.dishName.trim().length === 0) {
      throw new InvalidOrderItemFieldError('dish name');
    }

    if (this.quantity <= 0 || !Number.isInteger(this.quantity)) {
      throw new InvalidOrderItemQuantityError(this.quantity);
    }
  }

  getTotalPrice(): Price {
    const result = this.dishPrice.multiply(this.quantity);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  toJSON(): {
    id: string;
    dishId: string;
    dishName: string;
    dishPrice: string;
    quantity: number;
    specialInstructions?: string | undefined;
    totalPrice: string;
  } {
    return {
      id: this.id,
      dishId: this.dishId,
      dishName: this.dishName,
      dishPrice: this.dishPrice.toString(),
      quantity: this.quantity,
      ...(this.specialInstructions !== undefined && {
        specialInstructions: this.specialInstructions,
      }),
      totalPrice: this.getTotalPrice().toString(),
    };
  }
}
