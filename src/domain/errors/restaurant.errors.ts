export class RestaurantNotFoundError extends Error {
  constructor(restaurantId: string) {
    super(`Restaurant with id "${restaurantId}" not found`);
    this.name = 'RestaurantNotFoundError';
  }
}

export class RestaurantAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Restaurant with name "${name}" already exists`);
    this.name = 'RestaurantAlreadyExistsError';
  }
}

export class RestaurantClosedError extends Error {
  constructor(restaurantId: string) {
    super(`Restaurant "${restaurantId}" is currently closed`);
    this.name = 'RestaurantClosedError';
  }
}

export class DishNotFoundError extends Error {
  constructor(dishId: string) {
    super(`Dish with id "${dishId}" not found`);
    this.name = 'DishNotFoundError';
  }
}

export class DishOutOfStockError extends Error {
  constructor(dishName: string) {
    super(`Dish "${dishName}" is out of stock`);
    this.name = 'DishOutOfStockError';
  }
}

export class InsufficientStockError extends Error {
  constructor(dishName: string, requested: number, available: number) {
    super(
      `Insufficient stock for "${dishName}". Requested: ${requested}, Available: ${available}`
    );
    this.name = 'InsufficientStockError';
  }
}

export class InvalidStockQuantityError extends Error {
  constructor(quantity: number) {
    super(`Invalid stock quantity: ${quantity}. Quantity must be non-negative`);
    this.name = 'InvalidStockQuantityError';
  }
}

export class InvalidDishPriceError extends Error {
  constructor(price: number) {
    super(`Invalid dish price: ${price}. Price must be positive`);
    this.name = 'InvalidDishPriceError';
  }
}

export class InvalidRestaurantFieldError extends Error {
  constructor(field: string) {
    super(`Restaurant ${field} is required`);
    this.name = 'InvalidRestaurantFieldError';
  }
}

export class InvalidRestaurantRatingError extends Error {
  constructor(rating: number) {
    super(`Restaurant rating must be between 0 and 5, got ${rating}`);
    this.name = 'InvalidRestaurantRatingError';
  }
}

export class InvalidOpeningHoursError extends Error {
  constructor(message: string) {
    super(`Invalid opening hours: ${message}`);
    this.name = 'InvalidOpeningHoursError';
  }
}

export class InvalidDishFieldError extends Error {
  constructor(field: string) {
    super(`Dish ${field} is required`);
    this.name = 'InvalidDishFieldError';
  }
}

export class InvalidStockOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStockOperationError';
  }
}

export class StockExceedsDailyLimitError extends Error {
  constructor(available: number, daily: number) {
    super(`Available stock (${available}) cannot exceed daily stock (${daily})`);
    this.name = 'StockExceedsDailyLimitError';
  }
}
