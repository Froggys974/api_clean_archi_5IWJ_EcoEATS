import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';
import { OrderNotFoundError } from '@domain/errors/order.errors';

export type GetOrderByIdOutput = { order: Order };

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, clientId: string): Promise<ResultType<GetOrderByIdOutput, Error>> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order || !order.belongsToClient(clientId)) {
        return Result.Failed(new OrderNotFoundError(orderId));
      }

      return Result.Success({ order });
    } catch (error) {
      return Result.Failed(new Error(`Failed to get order: ${(error as Error).message}`));
    }
  }
}