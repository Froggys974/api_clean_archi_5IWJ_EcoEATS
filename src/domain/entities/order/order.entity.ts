import { Price } from '@domain/value-objects/price.value-object';
import { Address } from '@domain/value-objects/address.value-object';
import { OrderItem } from './order-item.entity';

const ESTIMATED_TRANSIT_MINUTES = 15;
import {
  EmptyOrderError,
  InvalidOrderStatusTransitionError,
  OrderAlreadyPaidError,
  OrderNotPaidError,
  OrderAlreadyCancelledError,
  OrderCannotBeCancelledError,
  OrderAlreadyAcceptedError,
  OrderAlreadyRefusedError,
  InvalidPreparationTimeError,
} from '@domain/errors/order.errors';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'ACCEPTED'
  | 'REFUSED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

type CreateOrderProps = {
  id: string;
  clientId: string;
  restaurantId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  itemsTotal: Price;
  deliveryFee: Price;
  serviceFee: Price;
  totalPrice: Price;
  status?: OrderStatus;
  preparationTimeMinutes?: number;
  isPaid?: boolean;
  paymentId?: string;
  acceptedAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Order {
  private constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly restaurantId: string,
    public readonly items: OrderItem[],
    public readonly deliveryAddress: Address,
    public readonly itemsTotal: Price,
    public readonly deliveryFee: Price,
    public readonly serviceFee: Price,
    public readonly totalPrice: Price,
    public readonly status: OrderStatus,
    public readonly preparationTimeMinutes: number | undefined,
    public readonly isPaid: boolean,
    public readonly paymentId: string | undefined,
    public readonly acceptedAt: Date | undefined,
    public readonly readyAt: Date | undefined,
    public readonly pickedUpAt: Date | undefined,
    public readonly deliveredAt: Date | undefined,
    public readonly cancelledAt: Date | undefined,
    public readonly cancellationReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  static create(props: CreateOrderProps): Order {
    return new Order(
      props.id,
      props.clientId,
      props.restaurantId,
      props.items,
      props.deliveryAddress,
      props.itemsTotal,
      props.deliveryFee,
      props.serviceFee,
      props.totalPrice,
      props.status ?? 'PENDING',
      props.preparationTimeMinutes,
      props.isPaid ?? false,
      props.paymentId,
      props.acceptedAt,
      props.readyAt,
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
      throw new Error('Order id is required');
    }

    if (!this.clientId || this.clientId.trim().length === 0) {
      throw new Error('Client id is required');
    }

    if (!this.restaurantId || this.restaurantId.trim().length === 0) {
      throw new Error('Restaurant id is required');
    }

    if (this.items.length === 0) {
      throw new EmptyOrderError();
    }

    if (
      this.preparationTimeMinutes !== undefined &&
      this.preparationTimeMinutes <= 0
    ) {
      throw new InvalidPreparationTimeError(this.preparationTimeMinutes);
    }
  }

  markAsPaid(paymentId: string): Order {
    if (this.isPaid) {
      throw new OrderAlreadyPaidError(this.id);
    }

    if (this.status === 'CANCELLED') {
      throw new OrderCannotBeCancelledError(this.id, this.status);
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'PAID',
      this.preparationTimeMinutes,
      true,
      paymentId,
      this.acceptedAt,
      this.readyAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  accept(preparationTimeMinutes: number): Order {
    if (!this.isPaid) {
      throw new OrderNotPaidError(this.id);
    }

    if (this.status === 'ACCEPTED' || this.status === 'PREPARING') {
      throw new OrderAlreadyAcceptedError(this.id);
    }

    if (this.status === 'REFUSED') {
      throw new OrderAlreadyRefusedError(this.id);
    }

    if (this.status === 'CANCELLED') {
      throw new OrderCannotBeCancelledError(this.id, this.status);
    }

    if (preparationTimeMinutes <= 0) {
      throw new InvalidPreparationTimeError(preparationTimeMinutes);
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'ACCEPTED',
      preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      new Date(),
      this.readyAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  refuse(reason?: string): Order {
    if (!this.isPaid) {
      throw new OrderNotPaidError(this.id);
    }

    if (this.status === 'ACCEPTED' || this.status === 'PREPARING') {
      throw new OrderAlreadyAcceptedError(this.id);
    }

    if (this.status === 'REFUSED') {
      throw new OrderAlreadyRefusedError(this.id);
    }

    if (this.status === 'CANCELLED') {
      throw new OrderCannotBeCancelledError(this.id, this.status);
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'REFUSED',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      this.readyAt,
      this.pickedUpAt,
      this.deliveredAt,
      new Date(),
      reason,
      this.createdAt,
      new Date()
    );
  }

  startPreparing(): Order {
    if (this.status !== 'ACCEPTED') {
      throw new InvalidOrderStatusTransitionError(this.status, 'PREPARING');
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'PREPARING',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      this.readyAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  markAsReady(): Order {
    if (this.status !== 'PREPARING' && this.status !== 'ACCEPTED') {
      throw new InvalidOrderStatusTransitionError(this.status, 'READY_FOR_PICKUP');
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'READY_FOR_PICKUP',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      new Date(),
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  markAsPickedUp(): Order {
    if (this.status !== 'READY_FOR_PICKUP') {
      throw new InvalidOrderStatusTransitionError(this.status, 'PICKED_UP');
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'PICKED_UP',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      this.readyAt,
      new Date(),
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  startDelivering(): Order {
    if (this.status !== 'PICKED_UP') {
      throw new InvalidOrderStatusTransitionError(this.status, 'DELIVERING');
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'DELIVERING',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      this.readyAt,
      this.pickedUpAt,
      this.deliveredAt,
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  markAsDelivered(): Order {
    if (this.status !== 'DELIVERING') {
      throw new InvalidOrderStatusTransitionError(this.status, 'DELIVERED');
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'DELIVERED',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      this.readyAt,
      this.pickedUpAt,
      new Date(),
      this.cancelledAt,
      this.cancellationReason,
      this.createdAt,
      new Date()
    );
  }

  cancel(reason?: string): Order {
    if (this.status === 'CANCELLED') {
      throw new OrderAlreadyCancelledError(this.id);
    }

    if (
      this.status === 'PICKED_UP' ||
      this.status === 'DELIVERING' ||
      this.status === 'DELIVERED'
    ) {
      throw new OrderCannotBeCancelledError(this.id, this.status);
    }

    return new Order(
      this.id,
      this.clientId,
      this.restaurantId,
      this.items,
      this.deliveryAddress,
      this.itemsTotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalPrice,
      'CANCELLED',
      this.preparationTimeMinutes,
      this.isPaid,
      this.paymentId,
      this.acceptedAt,
      this.readyAt,
      this.pickedUpAt,
      this.deliveredAt,
      new Date(),
      reason,
      this.createdAt,
      new Date()
    );
  }

  isActive(): boolean {
    return !['DELIVERED', 'CANCELLED', 'REFUSED'].includes(this.status);
  }

  isCompleted(): boolean {
    return this.status === 'DELIVERED';
  }

  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  isRefused(): boolean {
    return this.status === 'REFUSED';
  }

  canBeCancelled(): boolean {
    return !['PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED'].includes(
      this.status
    );
  }

  canBePickedUp(): boolean {
    return this.status === 'READY_FOR_PICKUP';
  }

  belongsToClient(clientId: string): boolean {
    return this.clientId === clientId;
  }

  belongsToRestaurant(restaurantId: string): boolean {
    return this.restaurantId === restaurantId;
  }

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getEstimatedDeliveryTime(): Date | undefined {
    if (!this.acceptedAt || !this.preparationTimeMinutes) {
      return undefined;
    }

    const estimatedTime = new Date(this.acceptedAt);
    estimatedTime.setMinutes(
      estimatedTime.getMinutes() + this.preparationTimeMinutes + ESTIMATED_TRANSIT_MINUTES
    );

    return estimatedTime;
  }
}
