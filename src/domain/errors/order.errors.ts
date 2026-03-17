export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order with id "${orderId}" not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class OrderAlreadyExistsError extends Error {
  constructor(orderId: string) {
    super(`Order with id "${orderId}" already exists`);
    this.name = 'OrderAlreadyExistsError';
  }
}

export class OrderAlreadyPaidError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" has already been paid`);
    this.name = 'OrderAlreadyPaidError';
  }
}

export class OrderNotPaidError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" has not been paid yet`);
    this.name = 'OrderNotPaidError';
  }
}

export class OrderAlreadyCancelledError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" has already been cancelled`);
    this.name = 'OrderAlreadyCancelledError';
  }
}

export class OrderCannotBeCancelledError extends Error {
  constructor(orderId: string, status: string) {
    super(`Order "${orderId}" cannot be cancelled. Current status: ${status}`);
    this.name = 'OrderCannotBeCancelledError';
  }
}

export class OrderAlreadyAcceptedError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" has already been accepted`);
    this.name = 'OrderAlreadyAcceptedError';
  }
}

export class OrderAlreadyRefusedError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" has already been refused`);
    this.name = 'OrderAlreadyRefusedError';
  }
}

export class OrderAlreadyDeliveredError extends Error {
  constructor(orderId: string) {
    super(`Order "${orderId}" has already been delivered`);
    this.name = 'OrderAlreadyDeliveredError';
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid order status transition from "${from}" to "${to}"`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export class EmptyOrderError extends Error {
  constructor() {
    super('Cannot create an order with no items');
    this.name = 'EmptyOrderError';
  }
}

export class InvalidPreparationTimeError extends Error {
  constructor(minutes: number) {
    super(
      `Invalid preparation time: ${minutes} minutes. Must be a positive value`
    );
    this.name = 'InvalidPreparationTimeError';
  }
}

export class OrderNotAssignedToRestaurantError extends Error {
  constructor(orderId: string, restaurantId: string) {
    super(
      `Order "${orderId}" is not assigned to restaurant "${restaurantId}"`
    );
    this.name = 'OrderNotAssignedToRestaurantError';
  }
}

export class OrderNotAssignedToCourierError extends Error {
  constructor(orderId: string, courierId: string) {
    super(`Order "${orderId}" is not assigned to courier "${courierId}"`);
    this.name = 'OrderNotAssignedToCourierError';
  }
}
