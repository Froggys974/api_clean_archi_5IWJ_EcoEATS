export class CartNotFoundError extends Error {
  constructor(cartId: string) {
    super(`Cart with id "${cartId}" not found`);
    this.name = 'CartNotFoundError';
  }
}

export class CartAlreadyExistsError extends Error {
  constructor(cartId: string) {
    super(`Cart with id "${cartId}" already exists`);
    this.name = 'CartAlreadyExistsError';
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super('Cart is empty');
    this.name = 'EmptyCartError';
  }
}

export class CartItemNotFoundError extends Error {
  constructor(dishId: string) {
    super(`Cart item with dish id "${dishId}" not found`);
    this.name = 'CartItemNotFoundError';
  }
}

export class DifferentRestaurantInCartError extends Error {
  constructor(currentRestaurantId: string, newRestaurantId: string) {
    super(
      `Cannot add items from restaurant "${newRestaurantId}". ` +
      `Cart already contains items from restaurant "${currentRestaurantId}". ` +
      `Please clear the cart first.`
    );
    this.name = 'DifferentRestaurantInCartError';
  }
}

export class InvalidCartItemQuantityError extends Error {
  constructor(quantity: number) {
    super(
      `Invalid cart item quantity: ${quantity}. Quantity must be a positive integer`
    );
    this.name = 'InvalidCartItemQuantityError';
  }
}

export class CartAlreadyCheckedOutError extends Error {
  constructor(cartId: string) {
    super(`Cart "${cartId}" has already been checked out`);
    this.name = 'CartAlreadyCheckedOutError';
  }
}
