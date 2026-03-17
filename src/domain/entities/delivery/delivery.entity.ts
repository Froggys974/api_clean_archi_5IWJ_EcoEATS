import { Price } from '@domain/value-objects/price.value-object';
import { Address } from '@domain/value-objects/address.value-object';
import { Distance } from '@domain/value-objects/distance.value-object';
import {
  DeliveryAlreadyAcceptedError,
  DeliveryAlreadyPickedUpError,
  DeliveryAlreadyCompletedError,
  DeliveryAlreadyCancelledError,
  InvalidDeliveryStatusTransitionError,
  DeliveryNotReadyForPickupError,
  InvalidDeliveryFeeError,
  InvalidTipAmountError,
} from '@domain/errors/delivery.errors';

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

type CreateDeliveryProps = {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantAddress: Address;
  deliveryAddress: Address;
  distance: Distance;
  deliveryFee: Price;
  courierId?: string;
  status?: DeliveryStatus;
  tipAmount?: Price;
  pickupFee: Price;
  pricePerKm: Price;
  assignedAt?: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Delivery {
  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly restaurantId: string,
    public readonly restaurantAddress: Address,
    public readonly deliveryAddress: Address,
    public readonly distance: Distance,
    public readonly deliveryFee: Price,
    public readonly courierId: string | undefined,
    public readonly status: DeliveryStatus,
    public readonly tipAmount: Price,
    public readonly pickupFee: Price,
    public readonly pricePerKm: Price,
    public readonly assignedAt: Date | undefined,
    public readonly acceptedAt: Date | undefined,
    public readonly pickedUpAt: Date | undefined,
    public readonly deliveredAt: Date | undefined,
    public readonly cancelledAt: Date | undefined,
    public readonly cancellationReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  static create(props: CreateDeliveryProps): Delivery {
    return new Delivery(
      props.id,
      props.orderId,
      props.restaurantId,
      props.restaurantAddress,
      props.deliveryAddress,
      props.distance,
      props.deliveryFee,
      props.courierId,
      props.status ?? 'PENDING',
      props.tipAmount ?? Price.zero(),
      props.pickupFee,
      props.pricePerKm,
      props.assignedAt,
      props.acceptedAt,
      props.pickedUpAt,
      props.deliveredAt,
      props.cancelledAt,
      props.cancellationReason,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Delivery id is required');
    }

    if (!this.orderId || this.orderId.trim().length === 0) {
      throw new Error('Order id is required');
    }

    if (!this.restaurantId || this.restaurantId.trim().length === 0) {
      throw new Error('Restaurant id is required');
    }

    if (this.deliveryFee.getAmount() < 0) {
      throw new InvalidDeliveryFeeError(this.deliveryFee.getAmount());
    }

    if (this.tipAmount.getAmount() < 0) {
      throw new InvalidTipAmountError(this.tipAmount.getAmount());
    }
  }

  assignToCourier(courierId: string): Delivery {
    if (this.status === 'CANCELLED') {
      throw new DeliveryAlreadyCancelledError(this.id);
    }

    if (this.status === 'DELIVERED') {
      throw new DeliveryAlreadyCompletedError(this.id);
    }

    if (this.status !== 'PENDING') {
      throw new InvalidDeliveryStatusTransitionError(this.status, 'ASSIGNED');
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      courierId,
      'ASSIGNED',
      this.tipAmount,
      this.pickupFee,
      this.pricePerKm,
      new Date(),
      this.acceptedAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  accept(): Delivery {
    if (this.status === 'ACCEPTED' || this.status === 'PICKED_UP') {
      throw new DeliveryAlreadyAcceptedError(this.id);
    }

    if (this.status === 'DELIVERED') {
      throw new DeliveryAlreadyCompletedError(this.id);
    }

    if (this.status === 'CANCELLED') {
      throw new DeliveryAlreadyCancelledError(this.id);
    }

    if (this.status !== 'ASSIGNED' && this.status !== 'PENDING') {
      throw new InvalidDeliveryStatusTransitionError(this.status, 'ACCEPTED');
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      this.courierId,
      'ACCEPTED',
      this.tipAmount,
      this.pickupFee,
      this.pricePerKm,
      this.assignedAt ?? new Date(),
      new Date(),
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  markAsPickedUp(): Delivery {
    if (this.status === 'PICKED_UP' || this.status === 'IN_TRANSIT') {
      throw new DeliveryAlreadyPickedUpError(this.id);
    }

    if (this.status === 'DELIVERED') {
      throw new DeliveryAlreadyCompletedError(this.id);
    }

    if (this.status === 'CANCELLED') {
      throw new DeliveryAlreadyCancelledError(this.id);
    }

    if (this.status !== 'ACCEPTED') {
      throw new DeliveryNotReadyForPickupError(this.id);
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      this.courierId,
      'PICKED_UP',
      this.tipAmount,
      this.pickupFee,
      this.pricePerKm,
      this.assignedAt,
      this.acceptedAt,
      new Date(),
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  startTransit(): Delivery {
    if (this.status !== 'PICKED_UP') {
      throw new InvalidDeliveryStatusTransitionError(this.status, 'IN_TRANSIT');
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      this.courierId,
      'IN_TRANSIT',
      this.tipAmount,
      this.pickupFee,
      this.pricePerKm,
      this.assignedAt,
      this.acceptedAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  markAsDelivered(): Delivery {
    if (this.status === 'DELIVERED') {
      throw new DeliveryAlreadyCompletedError(this.id);
    }

    if (this.status === 'CANCELLED') {
      throw new DeliveryAlreadyCancelledError(this.id);
    }

    if (this.status !== 'IN_TRANSIT' && this.status !== 'PICKED_UP') {
      throw new InvalidDeliveryStatusTransitionError(this.status, 'DELIVERED');
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      this.courierId,
      'DELIVERED',
      this.tipAmount,
      this.pickupFee,
      this.pricePerKm,
      this.assignedAt,
      this.acceptedAt,
      this.pickedUpAt,
      new Date(),
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  cancel(reason?: string): Delivery {
    if (this.status === 'CANCELLED') {
      throw new DeliveryAlreadyCancelledError(this.id);
    }

    if (this.status === 'DELIVERED') {
      throw new DeliveryAlreadyCompletedError(this.id);
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      this.courierId,
      'CANCELLED',
      this.tipAmount,
      this.pickupFee,
      this.pricePerKm,
      this.assignedAt,
      this.acceptedAt,
      this.pickedUpAt,
      this.deliveredAt,
      new Date(),
      reason,
      this.createdAt,
      new Date()
    );
  }

  addTip(tipAmount: Price): Delivery {
    if (tipAmount.getAmount() < 0) {
      throw new InvalidTipAmountError(tipAmount.getAmount());
    }

    return new Delivery(
      this.id,
      this.orderId,
      this.restaurantId,
      this.restaurantAddress,
      this.deliveryAddress,
      this.distance,
      this.deliveryFee,
      this.courierId,
      this.status,
      tipAmount,
      this.pickupFee,
      this.pricePerKm,
      this.assignedAt,
      this.acceptedAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Calculate the total earnings for the courier
   * Formula: Pickup Fee + (Price per km * Distance) + Tip
   * Platform takes no commission on courier's earnings
   */
  calculateCourierEarnings(): Price {
    let earnings = this.pickupFee;

    const distanceFeeResult = this.pricePerKm.multiply(this.distance.getKilometers());
    if (!distanceFeeResult.success) {
      throw distanceFeeResult.error;
    }

    const earningsWithDistanceResult = earnings.add(distanceFeeResult.data);
    if (!earningsWithDistanceResult.success) {
      throw earningsWithDistanceResult.error;
    }
    earnings = earningsWithDistanceResult.data;

    const earningsWithTipResult = earnings.add(this.tipAmount);
    if (!earningsWithTipResult.success) {
      throw earningsWithTipResult.error;
    }
    earnings = earningsWithTipResult.data;

    return earnings;
  }

  isAssignedToCourier(courierId: string): boolean {
    return this.courierId === courierId;
  }

  isActive(): boolean {
    return !['DELIVERED', 'CANCELLED'].includes(this.status);
  }

  isCompleted(): boolean {
    return this.status === 'DELIVERED';
  }

  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isAssigned(): boolean {
    return this.courierId !== undefined;
  }

  belongsToRestaurant(restaurantId: string): boolean {
    return this.restaurantId === restaurantId;
  }

  belongsToOrder(orderId: string): boolean {
    return this.orderId === orderId;
  }
}
