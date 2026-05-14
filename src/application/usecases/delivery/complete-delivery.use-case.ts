import { Result, ResultType } from "@domain/shared/result";
import { Delivery } from "@domain/entities/delivery/delivery.entity";
import { Wallet } from "@domain/entities/delivery/wallet.entity";
import { Order } from "@domain/entities/order/order.entity";
import { CourierProfile } from "@domain/entities/user/courier-profile.entity";
import { DeliveryRepository } from "@application/repositories/delivery.repository";
import { WalletRepository } from "@application/repositories/wallet.repository";
import { OrderRepository } from "@application/repositories/order.repository";
import { CourierProfileRepository } from "@application/repositories/courier-profile.repository";
import { NotificationPort } from "@application/ports/notification.port";
import { LoggerPort } from "@application/ports/logger.port";
import {
  DeliveryNotFoundError,
  DeliveryAlreadyCompletedError,
  InvalidDeliveryStatusTransitionError,
} from "@domain/errors/delivery.errors";
import { OrderNotFoundError } from "@domain/errors/order.errors";

export type CompleteDeliveryInput = {
  deliveryId: string;
  courierId: string;
  deliveryCode: string;
};

export type CompleteDeliveryOutput = {
  delivery: Delivery;
  order: Order;
  wallet: Wallet;
  earnings: {
    amount: string;
    breakdown: {
      pickupFee: string;
      distanceFee: string;
      tip: string;
      total: string;
    };
  };
};

export class CompleteDeliveryUseCase {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly walletRepository: WalletRepository,
    private readonly orderRepository: OrderRepository,
    private readonly courierProfileRepository: CourierProfileRepository,
    private readonly notificationService: NotificationPort,
    private readonly logger: LoggerPort,
  ) {}

  async execute(
    input: CompleteDeliveryInput,
  ): Promise<ResultType<CompleteDeliveryOutput, Error>> {
    try {
      const delivery = await this.deliveryRepository.findById(input.deliveryId);
      if (!delivery) {
        return Result.Failed(new DeliveryNotFoundError(input.deliveryId));
      }

      if (!delivery.isAssignedToCourier(input.courierId)) {
        return Result.Failed(
          new Error(
            `Delivery ${input.deliveryId} is not assigned to courier ${input.courierId}`,
          ),
        );
      }

      if (delivery.isCompleted()) {
        return Result.Failed(
          new DeliveryAlreadyCompletedError(input.deliveryId),
        );
      }

      if (delivery.status !== "IN_TRANSIT" && delivery.status !== "PICKED_UP") {
        return Result.Failed(
          new InvalidDeliveryStatusTransitionError(
            delivery.status,
            "DELIVERED",
          ),
        );
      }

      const order = await this.orderRepository.findById(delivery.orderId);
      if (!order) {
        return Result.Failed(new OrderNotFoundError(delivery.orderId));
      }

      if (order.deliveryCode !== input.deliveryCode) {
        return Result.Failed(new Error('Invalid delivery code'));
      }

      const completedDelivery = delivery.markAsDelivered();
      const deliveredOrder = order.markAsDelivered();

      const earnings = completedDelivery.calculateCourierEarnings();

      let wallet = await this.walletRepository.findByCourierId(input.courierId);

      if (!wallet) {
        wallet = Wallet.create({
          id: crypto.randomUUID(),
          courierId: input.courierId,
          balance: earnings,
        });
        await this.walletRepository.create(wallet);
      } else {
        wallet = wallet.addDeliveryEarning(
          crypto.randomUUID(),
          earnings,
          delivery.id,
        );
        await this.walletRepository.update(wallet);
      }

      const courierProfile = await this.courierProfileRepository.findByUserId(
        input.courierId,
      );
      if (courierProfile) {
        const updatedProfile = courierProfile.decrementActiveDeliveries();
        await this.courierProfileRepository.update(updatedProfile);
      }

      await this.deliveryRepository.update(completedDelivery);
      await this.orderRepository.update(deliveredOrder);

      try {
        await this.notificationService.notifyClientAboutOrder(
          deliveredOrder,
          "ORDER_DELIVERED",
          "", // Email should be fetched from user repository
          "Your order has been delivered successfully!",
        );

        await this.notificationService.notifyCourierAboutDelivery(
          completedDelivery,
          "DELIVERY_COMPLETED",
          input.courierId,
          "", // Email would be fetched
          undefined,
        );
      } catch (notificationError) {
        this.logger.error('Failed to send notifications', notificationError, 'CompleteDeliveryUseCase');
      }

      const distanceFeeResult = completedDelivery.pricePerKm.multiply(
        completedDelivery.distance.getKilometers(),
      );
      const distanceFeeStr = distanceFeeResult.success
        ? distanceFeeResult.data.toString()
        : "0.00 EUR";

      const earningsBreakdown = {
        amount: earnings.toString(),
        breakdown: {
          pickupFee: completedDelivery.pickupFee.toString(),
          distanceFee: distanceFeeStr,
          tip: completedDelivery.tipAmount.toString(),
          total: earnings.toString(),
        },
      };

      return Result.Success({
        delivery: completedDelivery,
        order: deliveredOrder,
        wallet,
        earnings: earningsBreakdown,
      });
    } catch (error) {
      if (
        error instanceof DeliveryNotFoundError ||
        error instanceof DeliveryAlreadyCompletedError ||
        error instanceof InvalidDeliveryStatusTransitionError ||
        error instanceof OrderNotFoundError
      ) {
        return Result.Failed(error);
      }

      return Result.Failed(
        new Error(`Failed to complete delivery: ${(error as Error).message}`),
      );
    }
  }

}
