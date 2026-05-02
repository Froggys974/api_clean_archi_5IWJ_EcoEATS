import { Result, ResultType } from '@domain/shared/result';
import { Delivery } from '@domain/entities/delivery/delivery.entity';
import { DeliveryRepository } from '@application/repositories/delivery.repository';

export type ListMyDeliveriesOutput = { deliveries: Delivery[] };

export class ListMyDeliveriesUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(courierId: string): Promise<ResultType<ListMyDeliveriesOutput, Error>> {
    const deliveries = await this.deliveryRepository.findByCourierId(courierId);
    return Result.Success({ deliveries });
  }
}
