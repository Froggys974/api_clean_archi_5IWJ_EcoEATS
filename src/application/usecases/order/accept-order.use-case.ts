import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { NotificationPort } from '@application/ports/notification.port';
import { UserRepository } from '@application/repositories/user.repository';
import {
  OrderNotFoundError,
  OrderNotPaidError,
  OrderAlreadyAcceptedError,
  OrderNotAssignedToRestaurantError,
  InvalidPreparationTimeError,
} from '@domain/errors/order.errors';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';
import { UserNotFoundError } from '@domain/errors/auth.errors';

export type AcceptOrderInput = {
  orderId: string;
  restaurantId: string;
  preparationTimeMinutes: number;
};

export type AcceptOrderOutput = {
  order: Order;
  estimatedReadyAt: Date;
};

export class AcceptOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationPort
  ) {}

  async execute(
    input: AcceptOrderInput
  ): Promise<ResultType<AcceptOrderOutput, Error>> {
    try {
      if (input.preparationTimeMinutes <= 0) {
        return Result.Failed(
          new InvalidPreparationTimeError(input.preparationTimeMinutes)
        );
      }

      const order = await this.orderRepository.findById(input.orderId);
      if (!order) {
        return Result.Failed(new OrderNotFoundError(input.orderId));
      }

      if (!order.belongsToRestaurant(input.restaurantId)) {
        return Result.Failed(
          new OrderNotAssignedToRestaurantError(input.orderId, input.restaurantId)
        );
      }

      const restaurant = await this.restaurantRepository.findById(input.restaurantId);
      if (!restaurant) {
        return Result.Failed(new RestaurantNotFoundError(input.restaurantId));
      }

      const acceptedOrder = order.accept(input.preparationTimeMinutes);

      const estimatedReadyAt = new Date();
      estimatedReadyAt.setMinutes(
        estimatedReadyAt.getMinutes() + input.preparationTimeMinutes
      );

      await this.orderRepository.update(acceptedOrder);

      try {
        const client = await this.userRepository.findById(order.clientId);
        if (client) {
          await this.notificationService.notifyClientAboutOrder(
            acceptedOrder,
            'ORDER_ACCEPTED',
            client.email.getValue(),
            `Your order has been accepted by ${restaurant.name}. ` +
              `Estimated preparation time: ${input.preparationTimeMinutes} minutes. ` +
              `Ready at approximately: ${estimatedReadyAt.toLocaleTimeString()}`
          );
        }
      } catch (notificationError) {
        console.error('Failed to send notification to client:', notificationError);
      }

      return Result.Success({
        order: acceptedOrder,
        estimatedReadyAt,
      });
    } catch (error) {
      if (
        error instanceof OrderNotFoundError ||
        error instanceof OrderNotPaidError ||
        error instanceof OrderAlreadyAcceptedError ||
        error instanceof OrderNotAssignedToRestaurantError ||
        error instanceof InvalidPreparationTimeError ||
        error instanceof RestaurantNotFoundError
      ) {
        return Result.Failed(error);
      }

      return Result.Failed(
        new Error(`Failed to accept order: ${(error as Error).message}`)
      );
    }
  }
}
