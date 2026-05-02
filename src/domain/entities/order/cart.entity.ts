import { Price } from "@domain/value-objects/price.value-object";
import { CartItem } from "./cart-item.entity";
import {
  EmptyCartError,
  CartItemNotFoundError,
  DifferentRestaurantInCartError,
  CartAlreadyCheckedOutError,
} from "@domain/errors/cart.errors";

type CreateCartProps = {
  id: string;
  clientId: string;
  restaurantId?: string;
  items?: CartItem[];
  isCheckedOut?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Cart {
  private constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly restaurantId: string | undefined,
    public readonly items: CartItem[],
    public readonly isCheckedOut: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  static create(props: CreateCartProps): Cart {
    return new Cart(
      props.id,
      props.clientId,
      props.restaurantId,
      props.items ?? [],
      props.isCheckedOut ?? false,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error("Cart id is required");
    }

    if (!this.clientId || this.clientId.trim().length === 0) {
      throw new Error("Client id is required");
    }

  }

  addItem(item: CartItem, restaurantId: string): Cart {
    if (this.isCheckedOut) {
      throw new CartAlreadyCheckedOutError(this.id);
    }

    // Can only contain items from one restaurant in cart
    if (this.restaurantId && this.restaurantId !== restaurantId) {
      throw new DifferentRestaurantInCartError(this.restaurantId, restaurantId);
    }

    const existingItemIndex = this.items.findIndex(
      (i) => i.dishId === item.dishId,
    );

    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      newItems = [...this.items];
      const existingItem = newItems[existingItemIndex];
      if (!existingItem) {
        throw new Error("Cart item not found at index");
      }
      newItems[existingItemIndex] = existingItem.increaseQuantity(
        item.quantity,
      );
    } else {
      newItems = [...this.items, item];
    }

    return new Cart(
      this.id,
      this.clientId,
      restaurantId,
      newItems,
      this.isCheckedOut,
      this.createdAt,
      new Date(),
    );
  }

  removeItem(dishId: string): Cart {
    if (this.isCheckedOut) {
      throw new CartAlreadyCheckedOutError(this.id);
    }

    const itemIndex = this.items.findIndex((i) => i.dishId === dishId);

    if (itemIndex === -1) {
      throw new CartItemNotFoundError(dishId);
    }

    const newItems = this.items.filter((i) => i.dishId !== dishId);

    const newRestaurantId =
      newItems.length === 0 ? undefined : this.restaurantId;

    return new Cart(
      this.id,
      this.clientId,
      newRestaurantId,
      newItems,
      this.isCheckedOut,
      this.createdAt,
      new Date(),
    );
  }

  updateItemQuantity(dishId: string, quantity: number): Cart {
    if (this.isCheckedOut) {
      throw new CartAlreadyCheckedOutError(this.id);
    }

    const itemIndex = this.items.findIndex((i) => i.dishId === dishId);

    if (itemIndex === -1) {
      throw new CartItemNotFoundError(dishId);
    }

    const newItems = [...this.items];
    const existingItem = newItems[itemIndex];
    if (!existingItem) {
      throw new Error("Cart item not found at index");
    }
    newItems[itemIndex] = existingItem.setQuantity(quantity);

    return new Cart(
      this.id,
      this.clientId,
      this.restaurantId,
      newItems,
      this.isCheckedOut,
      this.createdAt,
      new Date(),
    );
  }

  updateItemInstructions(
    dishId: string,
    instructions: string | undefined,
  ): Cart {
    if (this.isCheckedOut) {
      throw new CartAlreadyCheckedOutError(this.id);
    }

    const itemIndex = this.items.findIndex((i) => i.dishId === dishId);

    if (itemIndex === -1) {
      throw new CartItemNotFoundError(dishId);
    }

    const newItems = [...this.items];
    const existingItem = newItems[itemIndex];
    if (!existingItem) {
      throw new Error("Cart item not found at index");
    }
    newItems[itemIndex] = existingItem.setSpecialInstructions(instructions);

    return new Cart(
      this.id,
      this.clientId,
      this.restaurantId,
      newItems,
      this.isCheckedOut,
      this.createdAt,
      new Date(),
    );
  }

  clear(): Cart {
    if (this.isCheckedOut) {
      throw new CartAlreadyCheckedOutError(this.id);
    }

    return new Cart(
      this.id,
      this.clientId,
      undefined,
      [],
      this.isCheckedOut,
      this.createdAt,
      new Date(),
    );
  }

  checkout(): Cart {
    if (this.isEmpty()) {
      throw new EmptyCartError();
    }

    if (this.isCheckedOut) {
      throw new CartAlreadyCheckedOutError(this.id);
    }

    return new Cart(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      true,
      this.createdAt,
      new Date(),
    );
  }

  getTotalPrice(): Price {
    if (this.isEmpty()) {
      return Price.zero();
    }

    let total = Price.zero();

    for (const item of this.items) {
      const itemTotal = item.getTotalPrice();
      const result = total.add(itemTotal);
      if (!result.success) {
        throw result.error;
      }
      total = result.data;
    }

    return total;
  }

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  hasItem(dishId: string): boolean {
    return this.items.some((i) => i.dishId === dishId);
  }

  getItem(dishId: string): CartItem | undefined {
    return this.items.find((i) => i.dishId === dishId);
  }

  belongsToClient(clientId: string): boolean {
    return this.clientId === clientId;
  }

  belongsToRestaurant(restaurantId: string): boolean {
    return this.restaurantId === restaurantId;
  }
}
