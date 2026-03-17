export class DeliveryNotFoundError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery with id "${deliveryId}" not found`);
    this.name = 'DeliveryNotFoundError';
  }
}

export class DeliveryAlreadyExistsError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery with id "${deliveryId}" already exists`);
    this.name = 'DeliveryAlreadyExistsError';
  }
}

export class CourierNotAvailableError extends Error {
  constructor(courierId: string) {
    super(`Courier "${courierId}" is not available for delivery`);
    this.name = 'CourierNotAvailableError';
  }
}

export class CourierAlreadyHasActiveDeliveryError extends Error {
  constructor(courierId: string) {
    super(
      `Courier "${courierId}" already has an active delivery. ` +
      `Only expert couriers can handle multiple deliveries.`
    );
    this.name = 'CourierAlreadyHasActiveDeliveryError';
  }
}

export class CourierCannotAcceptMultipleDeliveriesError extends Error {
  constructor(courierId: string) {
    super(
      `Courier "${courierId}" cannot accept multiple deliveries. ` +
      `Only expert couriers can handle two deliveries from the same restaurant.`
    );
    this.name = 'CourierCannotAcceptMultipleDeliveriesError';
  }
}

export class DeliveriesNotFromSameRestaurantError extends Error {
  constructor(restaurantId1: string, restaurantId2: string) {
    super(
      `Cannot accept multiple deliveries from different restaurants. ` +
      `Restaurant IDs: "${restaurantId1}" and "${restaurantId2}"`
    );
    this.name = 'DeliveriesNotFromSameRestaurantError';
  }
}

export class DeliveryAlreadyAcceptedError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery "${deliveryId}" has already been accepted`);
    this.name = 'DeliveryAlreadyAcceptedError';
  }
}

export class DeliveryAlreadyPickedUpError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery "${deliveryId}" has already been picked up`);
    this.name = 'DeliveryAlreadyPickedUpError';
  }
}

export class DeliveryAlreadyCompletedError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery "${deliveryId}" has already been completed`);
    this.name = 'DeliveryAlreadyCompletedError';
  }
}

export class DeliveryAlreadyCancelledError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery "${deliveryId}" has already been cancelled`);
    this.name = 'DeliveryAlreadyCancelledError';
  }
}

export class InvalidDeliveryStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid delivery status transition from "${from}" to "${to}"`);
    this.name = 'InvalidDeliveryStatusTransitionError';
  }
}

export class DeliveryNotReadyForPickupError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery "${deliveryId}" is not ready for pickup yet`);
    this.name = 'DeliveryNotReadyForPickupError';
  }
}

export class DeliveryNotAssignedToCourierError extends Error {
  constructor(deliveryId: string) {
    super(`Delivery "${deliveryId}" is not assigned to any courier`);
    this.name = 'DeliveryNotAssignedToCourierError';
  }
}

export class InvalidDeliveryFeeError extends Error {
  constructor(fee: number) {
    super(`Invalid delivery fee: ${fee}. Fee must be non-negative`);
    this.name = 'InvalidDeliveryFeeError';
  }
}

export class InvalidTipAmountError extends Error {
  constructor(amount: number) {
    super(`Invalid tip amount: ${amount}. Tip must be non-negative`);
    this.name = 'InvalidTipAmountError';
  }
}
