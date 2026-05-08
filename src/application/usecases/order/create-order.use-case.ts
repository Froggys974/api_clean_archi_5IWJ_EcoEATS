import { Result, ResultType } from "@domain/shared/result";
import { Order } from "@domain/entities/order/order.entity";
import { OrderItem } from "@domain/entities/order/order-item.entity";
import {
  Invoice,
  InvoiceLineItem,
} from "@domain/entities/order/invoice.entity";
import { Price } from "@domain/value-objects/price.value-object";
import { Address } from "@domain/value-objects/address.value-object";
import { CartRepository } from "@application/repositories/cart.repository";
import { OrderRepository } from "@application/repositories/order.repository";
import { InvoiceRepository } from "@application/repositories/invoice.repository";
import { RestaurantRepository } from "@application/repositories/restaurant.repository";
import { UserRepository } from "@application/repositories/user.repository";
import {
  DistanceCalculatorPort,
  PricingConfig,
} from "@application/ports/distance-calculator.port";
import { PaymentPort, PaymentMethod } from "@application/ports/payment.port";
import { NotificationPort } from "@application/ports/notification.port";
import {
  CartNotFoundError,
  EmptyCartError,
  CartAlreadyCheckedOutError,
} from "@domain/errors/cart.errors";
import {
  RestaurantNotFoundError,
  RestaurantClosedError,
} from "@domain/errors/restaurant.errors";
import { UserNotFoundError } from "@domain/errors/auth.errors";

const PICKUP_FEE = 2.5;
const PRICE_PER_KM = 1.5;
const MIN_DELIVERY_FEE = 3.0;
const MAX_DELIVERY_FEE = 15.0;

export type CreateOrderInput = {
  cartId: string;
  clientId: string;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  serviceFeeRate: number;
};

export type CreateOrderOutput = {
  order: Order;
  invoice: Invoice;
  paymentId: string;
};

export class CreateOrderUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly userRepository: UserRepository,
    private readonly distanceCalculator: DistanceCalculatorPort,
    private readonly paymentService: PaymentPort,
    private readonly notificationService: NotificationPort,
  ) {}

  async execute(
    input: CreateOrderInput,
  ): Promise<ResultType<CreateOrderOutput, Error>> {
    try {
      const cart = await this.cartRepository.findById(input.cartId);
      if (!cart) {
        return Result.Failed(new CartNotFoundError(input.cartId));
      }

      if (cart.isEmpty()) {
        return Result.Failed(new EmptyCartError());
      }

      if (cart.isCheckedOut) {
        return Result.Failed(new CartAlreadyCheckedOutError(input.cartId));
      }

      if (!cart.belongsToClient(input.clientId)) {
        return Result.Failed(new Error("Cart does not belong to this client"));
      }

      if (!cart.restaurantId) {
        return Result.Failed(new Error("Cart has no restaurant assigned"));
      }

      const restaurant = await this.restaurantRepository.findById(
        cart.restaurantId,
      );
      if (!restaurant) {
        return Result.Failed(new RestaurantNotFoundError(cart.restaurantId));
      }

      if (restaurant.isClosed()) {
        return Result.Failed(new RestaurantClosedError(restaurant.id));
      }

      const client = await this.userRepository.findById(input.clientId);
      if (!client) {
        return Result.Failed(new UserNotFoundError());
      }

      const pickupFeeResult = Price.create(PICKUP_FEE);
      const pricePerKmResult = Price.create(PRICE_PER_KM);
      const minDeliveryFeeResult = Price.create(MIN_DELIVERY_FEE);
      const maxDeliveryFeeResult = Price.create(MAX_DELIVERY_FEE);

      if (
        !pickupFeeResult.success ||
        !pricePerKmResult.success ||
        !minDeliveryFeeResult.success ||
        !maxDeliveryFeeResult.success
      ) {
        return Result.Failed(
          new Error("Failed to create pricing configuration"),
        );
      }

      const pricingConfig: PricingConfig = {
        pickupFee: pickupFeeResult.data,
        pricePerKm: pricePerKmResult.data,
        minDeliveryFee: minDeliveryFeeResult.data,
        maxDeliveryFee: maxDeliveryFeeResult.data,
      };

      const deliveryFeeCalc =
        this.distanceCalculator.calculateDeliveryFeeFromAddresses(
          restaurant.address,
          input.deliveryAddress,
          pricingConfig,
        );

      const itemsTotal = cart.getTotalPrice();
      const deliveryFee = deliveryFeeCalc.totalFee;

      const serviceFeeResult = itemsTotal.multiply(input.serviceFeeRate);
      if (!serviceFeeResult.success) {
        return Result.Failed(serviceFeeResult.error);
      }
      const serviceFee = serviceFeeResult.data;

      let totalPrice = itemsTotal;
      const withDeliveryResult = totalPrice.add(deliveryFee);
      if (!withDeliveryResult.success) {
        return Result.Failed(withDeliveryResult.error);
      }
      totalPrice = withDeliveryResult.data;

      const withServiceFeeResult = totalPrice.add(serviceFee);
      if (!withServiceFeeResult.success) {
        return Result.Failed(withServiceFeeResult.error);
      }
      totalPrice = withServiceFeeResult.data;

      const orderItems: OrderItem[] = cart.items.map((cartItem) => {
        const orderItemProps: {
          id: string;
          dishId: string;
          dishName: string;
          dishPrice: Price;
          quantity: number;
          specialInstructions?: string;
        } = {
          id: this.generateOrderItemId(),
          dishId: cartItem.dishId,
          dishName: cartItem.dishName,
          dishPrice: cartItem.dishPrice,
          quantity: cartItem.quantity,
        };

        if (cartItem.specialInstructions !== undefined) {
          orderItemProps.specialInstructions = cartItem.specialInstructions;
        }

        return OrderItem.create(orderItemProps);
      });

      const orderId = this.generateOrderId();
      const order = Order.create({
        id: orderId,
        clientId: input.clientId,
        restaurantId: restaurant.id,
        items: orderItems,
        deliveryAddress: input.deliveryAddress,
        itemsTotal,
        deliveryFee,
        serviceFee,
        totalPrice,
        status: "PENDING",
        isPaid: false,
      });

      const paymentResult = await this.paymentService.processPayment(
        orderId,
        totalPrice,
        input.paymentMethod,
        input.clientId,
      );

      if (!paymentResult.success) {
        return Result.Failed(
          new Error(
            `Payment failed: ${paymentResult.message || "Unknown error"}`,
          ),
        );
      }

      const paidOrder = order.markAsPaid(paymentResult.paymentId);

      const invoiceNumber =
        await this.invoiceRepository.generateInvoiceNumber();
      const invoiceLineItems: InvoiceLineItem[] = orderItems.map((item) => ({
        id: item.id,
        dishName: item.dishName,
        quantity: item.quantity,
        unitPrice: item.dishPrice,
        totalPrice: item.getTotalPrice(),
      }));

      const invoice = Invoice.create({
        id: this.generateInvoiceId(),
        orderId: paidOrder.id,
        invoiceNumber,
        clientId: input.clientId,
        clientName: `${client.firstName} ${client.lastName}`,
        clientAddress: input.deliveryAddress,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        lineItems: invoiceLineItems,
        itemsSubtotal: itemsTotal,
        deliveryFee,
        serviceFee,
        totalAmount: totalPrice,
        paymentMethod: input.paymentMethod,
        paymentId: paymentResult.paymentId,
        isPaid: true,
        paidAt: new Date(),
      });

      const checkedOutCart = cart.checkout();

      await this.orderRepository.create(paidOrder);
      await this.invoiceRepository.create(invoice);
      await this.cartRepository.update(checkedOutCart);

      try {
        await this.notificationService.notifyClientAboutOrder(
          paidOrder,
          "ORDER_CREATED",
          client.email.getValue(),
          `Your order has been placed successfully. Total: ${totalPrice.toString()}`,
        );

        await this.notificationService.notifyRestaurantAboutOrder(
          paidOrder,
          "ORDER_CREATED",
          restaurant.ownerId,
          restaurant.phone.getValue(),
        );
      } catch (notificationError) {
        console.error("Failed to send notifications:", notificationError);
      }

      return Result.Success({
        order: paidOrder,
        invoice,
        paymentId: paymentResult.paymentId,
      });
    } catch (error) {
      if (
        error instanceof CartNotFoundError ||
        error instanceof EmptyCartError ||
        error instanceof CartAlreadyCheckedOutError ||
        error instanceof RestaurantNotFoundError ||
        error instanceof RestaurantClosedError ||
        error instanceof UserNotFoundError
      ) {
        return Result.Failed(error);
      }

      return Result.Failed(
        new Error(`Failed to create order: ${(error as Error).message}`),
      );
    }
  }

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateOrderItemId(): string {
    return `order-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateInvoiceId(): string {
    return `invoice-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
