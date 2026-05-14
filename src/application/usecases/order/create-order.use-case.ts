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
import { DistanceCalculatorPort } from "@application/ports/distance-calculator.port";
import { PaymentPort, PaymentMethod } from "@application/ports/payment.port";
import { NotificationPort } from "@application/ports/notification.port";
import { LoggerPort } from "@application/ports/logger.port";
import { buildPricingConfig } from "@application/config/delivery-pricing.config";
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

export type CreateOrderInput = {
  cartId: string;
  clientId: string;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  serviceFeeRate: number;
  tipAmount?: number;
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
    private readonly logger: LoggerPort,
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

      const pricingConfig = buildPricingConfig();

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

      // Tip: optional, paid 100% to the courier, no platform commission
      let tipPrice = Price.zero();
      if (input.tipAmount !== undefined && input.tipAmount > 0) {
        const tipResult = Price.create(input.tipAmount);
        if (!tipResult.success) {
          return Result.Failed(new Error("Invalid tip amount"));
        }
        tipPrice = tipResult.data;
      }

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

      // Tip is added to total AFTER service fee computation (platform takes no commission on tip)
      const withTipResult = totalPrice.add(tipPrice);
      if (!withTipResult.success) {
        return Result.Failed(withTipResult.error);
      }
      totalPrice = withTipResult.data;

      const orderItems: OrderItem[] = cart.items.map((cartItem) => {
        const orderItemProps: {
          id: string;
          dishId: string;
          dishName: string;
          dishPrice: Price;
          quantity: number;
          specialInstructions?: string;
        } = {
          id: crypto.randomUUID(),
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

      const orderId = crypto.randomUUID();
      const order = Order.create({
        id: orderId,
        clientId: input.clientId,
        restaurantId: restaurant.id,
        items: orderItems,
        deliveryAddress: input.deliveryAddress,
        itemsTotal,
        deliveryFee,
        serviceFee,
        tipAmount: tipPrice,
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
        id: crypto.randomUUID(),
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
        tipAmount: tipPrice,
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
        this.logger.error('Failed to send notifications', notificationError, 'CreateOrderUseCase');
      }

      return Result.Success({
        order: paidOrder,
        invoice,
        paymentId: paymentResult.paymentId,
      });
    } catch (error) {
      return Result.Failed(
        error instanceof Error ? error : new Error('Unexpected error creating order'),
      );
    }
  }
}
