import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

export type ListOrdersByRestaurantOutput = { orders: Order[] };

export class ListOrdersByRestaurantUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(ownerId: string): Promise<ResultType<ListOrdersByRestaurantOutput, Error>> {
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);
    if (restaurants.length === 0) return Result.Failed(new RestaurantNotFoundError(ownerId));

    const restaurant = restaurants[0]!;
    const orders = await this.orderRepository.findByRestaurantId(restaurant.id);
    return Result.Success({ orders });
  }
}
