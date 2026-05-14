import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { NotificationPort } from '@application/ports/notification.port';
import { UserRepository } from '@application/repositories/user.repository';
import { LoggerPort } from '@application/ports/logger.port';
import {
  OrderNotFoundError,
  OrderNotPaidError,
  OrderAlreadyAcceptedError,
  OrderNotAssignedToRestaurantError,
  InvalidPreparationTimeError,
} from '@domain/errors/order.errors';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type AcceptOrderInput = {
  orderId: string;
  ownerId: string;
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
    private readonly notificationService: NotificationPort,
    private readonly logger: LoggerPort,
  ) {}

  async execute(
    input: AcceptOrderInput
  ): Promise<ResultType<AcceptOrderOutput, Error>> {
    try {
      if (input.preparationTimeMinutes <= 0) {
        return Result.Failed(new InvalidPreparationTimeError(input.preparationTimeMinutes));
      }

      const restaurants = await this.restaurantRepository.findByOwnerId(input.ownerId);
      if (restaurants.length === 0) {
        return Result.Failed(new RestaurantNotFoundError(input.ownerId));
      }
      const restaurant = restaurants[0]!;

      const order = await this.orderRepository.findById(input.orderId);
      if (!order) {
        return Result.Failed(new OrderNotFoundError(input.orderId));
      }

      if (!order.belongsToRestaurant(restaurant.id)) {
        return Result.Failed(new OrderNotAssignedToRestaurantError(input.orderId, restaurant.id));
      }

      const acceptedOrder = order.accept(input.preparationTimeMinutes);
      const preparingOrder = acceptedOrder.startPreparing();

      const estimatedReadyAt = new Date();
      estimatedReadyAt.setMinutes(estimatedReadyAt.getMinutes() + input.preparationTimeMinutes);

      await this.orderRepository.update(preparingOrder);

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
        this.logger.error('Failed to send notification to client', notificationError, 'AcceptOrderUseCase');
      }

      return Result.Success({ order: preparingOrder, estimatedReadyAt });
    } catch (error) {
      return Result.Failed(
        error instanceof Error ? error : new Error('Unexpected error accepting order')
      );
    }
  }
}
