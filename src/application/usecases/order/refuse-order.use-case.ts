import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { OrderNotFoundError } from '@domain/errors/order.errors';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type RefuseOrderInput = { orderId: string; ownerId: string; reason?: string };
export type RefuseOrderOutput = { order: Order };

export class RefuseOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(input: RefuseOrderInput): Promise<ResultType<RefuseOrderOutput, Error>> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) return Result.Failed(new OrderNotFoundError(input.orderId));

    const restaurant = await this.restaurantRepository.findById(order.restaurantId);
    if (!restaurant) return Result.Failed(new RestaurantNotFoundError(order.restaurantId));

    if (!restaurant.belongsToOwner(input.ownerId)) {
      return Result.Failed(new Error('You do not own this restaurant'));
    }

    const refused = order.refuse(input.reason);
    await this.orderRepository.update(refused);
    return Result.Success({ order: refused });
  }
}
