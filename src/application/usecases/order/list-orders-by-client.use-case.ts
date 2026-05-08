import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';

export type ListOrdersByClientOutput = { orders: Order[] };

export class ListOrdersByClientUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(clientId: string): Promise<ResultType<ListOrdersByClientOutput, Error>> {
    try {
      const orders = await this.orderRepository.findByClientId(clientId);
      return Result.Success({ orders });
    } catch (error) {
      return Result.Failed(new Error(`Failed to list orders: ${(error as Error).message}`));
    }
  }
}
