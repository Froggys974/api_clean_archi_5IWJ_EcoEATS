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
  InvalidOrderFieldError,
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
  tipAmount?: Price;
  totalPrice: Price;
  deliveryCode?: string;
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
    public readonly tipAmount: Price,
    public readonly totalPrice: Price,
    public readonly deliveryCode: string,
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
    const deliveryCode = props.deliveryCode ?? String(Math.floor(1000 + Math.random() * 9000));
    return new Order(
      props.id,
      props.clientId,
      props.restaurantId,
      props.items,
      props.deliveryAddress,
      props.itemsTotal,
      props.deliveryFee,
      props.serviceFee,
      props.tipAmount ?? Price.zero(),
      props.totalPrice,
      deliveryCode,
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
      throw new InvalidOrderFieldError('id');
    }

    if (!this.clientId || this.clientId.trim().length === 0) {
      throw new InvalidOrderFieldError('client id');
    }

    if (!this.restaurantId || this.restaurantId.trim().length === 0) {
      throw new InvalidOrderFieldError('restaurant id');
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

  private toProps(): CreateOrderProps {
    const props: CreateOrderProps = {
      id: this.id,
      clientId: this.clientId,
      restaurantId: this.restaurantId,
      items: this.items,
      deliveryAddress: this.deliveryAddress,
      itemsTotal: this.itemsTotal,
      deliveryFee: this.deliveryFee,
      serviceFee: this.serviceFee,
      tipAmount: this.tipAmount,
      totalPrice: this.totalPrice,
      deliveryCode: this.deliveryCode,
      status: this.status,
      isPaid: this.isPaid,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    };
    if (this.preparationTimeMinutes !== undefined) props.preparationTimeMinutes = this.preparationTimeMinutes;
    if (this.paymentId !== undefined) props.paymentId = this.paymentId;
    if (this.acceptedAt !== undefined) props.acceptedAt = this.acceptedAt;
    if (this.readyAt !== undefined) props.readyAt = this.readyAt;
    if (this.pickedUpAt !== undefined) props.pickedUpAt = this.pickedUpAt;
    if (this.deliveredAt !== undefined) props.deliveredAt = this.deliveredAt;
    if (this.cancelledAt !== undefined) props.cancelledAt = this.cancelledAt;
    if (this.cancellationReason !== undefined) props.cancellationReason = this.cancellationReason;
    return props;
  }

  private with(overrides: Partial<CreateOrderProps>): Order {
    return Order.create({ ...this.toProps(), ...overrides });
  }

  markAsPaid(paymentId: string): Order {
    if (this.isPaid) throw new OrderAlreadyPaidError(this.id);
    if (this.status === 'CANCELLED') throw new OrderCannotBeCancelledError(this.id, this.status);
    return this.with({ status: 'PAID', isPaid: true, paymentId });
  }

  accept(preparationTimeMinutes: number): Order {
    if (!this.isPaid) throw new OrderNotPaidError(this.id);
    if (this.status === 'ACCEPTED' || this.status === 'PREPARING') throw new OrderAlreadyAcceptedError(this.id);
    if (this.status === 'REFUSED') throw new OrderAlreadyRefusedError(this.id);
    if (this.status === 'CANCELLED') throw new OrderCannotBeCancelledError(this.id, this.status);
    if (preparationTimeMinutes <= 0) throw new InvalidPreparationTimeError(preparationTimeMinutes);
    return this.with({ status: 'ACCEPTED', preparationTimeMinutes, acceptedAt: new Date() });
  }

  refuse(reason?: string): Order {
    if (!this.isPaid) throw new OrderNotPaidError(this.id);
    if (this.status === 'ACCEPTED' || this.status === 'PREPARING') throw new OrderAlreadyAcceptedError(this.id);
    if (this.status === 'REFUSED') throw new OrderAlreadyRefusedError(this.id);
    if (this.status === 'CANCELLED') throw new OrderCannotBeCancelledError(this.id, this.status);
    const override: Partial<CreateOrderProps> = { status: 'REFUSED', cancelledAt: new Date() };
    if (reason !== undefined) override.cancellationReason = reason;
    return this.with(override);
  }

  startPreparing(): Order {
    if (this.status !== 'ACCEPTED') throw new InvalidOrderStatusTransitionError(this.status, 'PREPARING');
    return this.with({ status: 'PREPARING' });
  }

  markAsReady(): Order {
    if (this.status !== 'PREPARING' && this.status !== 'ACCEPTED') {
      throw new InvalidOrderStatusTransitionError(this.status, 'READY_FOR_PICKUP');
    }
    return this.with({ status: 'READY_FOR_PICKUP', readyAt: new Date() });
  }

  markAsPickedUp(): Order {
    if (this.status !== 'READY_FOR_PICKUP') throw new InvalidOrderStatusTransitionError(this.status, 'PICKED_UP');
    return this.with({ status: 'PICKED_UP', pickedUpAt: new Date() });
  }

  startDelivering(): Order {
    if (this.status !== 'PICKED_UP') throw new InvalidOrderStatusTransitionError(this.status, 'DELIVERING');
    return this.with({ status: 'DELIVERING' });
  }

  markAsDelivered(): Order {
    if (this.status !== 'DELIVERING') throw new InvalidOrderStatusTransitionError(this.status, 'DELIVERED');
    return this.with({ status: 'DELIVERED', deliveredAt: new Date() });
  }

  cancel(reason?: string): Order {
    if (this.status === 'CANCELLED') throw new OrderAlreadyCancelledError(this.id);
    if (['PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(this.status)) {
      throw new OrderCannotBeCancelledError(this.id, this.status);
    }
    const override: Partial<CreateOrderProps> = { status: 'CANCELLED', cancelledAt: new Date() };
    if (reason !== undefined) override.cancellationReason = reason;
    return this.with(override);
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
