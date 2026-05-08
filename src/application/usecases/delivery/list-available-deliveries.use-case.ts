import { Result, ResultType } from '@domain/shared/result';
import { Delivery } from '@domain/entities/delivery/delivery.entity';
import { DeliveryRepository } from '@application/repositories/delivery.repository';

export type ListAvailableDeliveriesOutput = { deliveries: Delivery[] };

export class ListAvailableDeliveriesUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(): Promise<ResultType<ListAvailableDeliveriesOutput, Error>> {
    const deliveries = await this.deliveryRepository.findPendingDeliveries();
    return Result.Success({ deliveries });
  }
}
