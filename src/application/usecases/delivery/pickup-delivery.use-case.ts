import { Result, ResultType } from '@domain/shared/result';
import { Delivery } from '@domain/entities/delivery/delivery.entity';
import { DeliveryRepository } from '@application/repositories/delivery.repository';
import {
  DeliveryNotFoundError,
  DeliveryAlreadyPickedUpError,
  DeliveryAlreadyCompletedError,
  DeliveryNotReadyForPickupError,
} from '@domain/errors/delivery.errors';

export type PickupDeliveryInput = {
  deliveryId: string;
  courierId: string;
};

export type PickupDeliveryOutput = { delivery: Delivery };

export class PickupDeliveryUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(input: PickupDeliveryInput): Promise<ResultType<PickupDeliveryOutput, Error>> {
    try {
      const delivery = await this.deliveryRepository.findById(input.deliveryId);
      if (!delivery) {
        return Result.Failed(new DeliveryNotFoundError(input.deliveryId));
      }

      if (!delivery.isAssignedToCourier(input.courierId)) {
        return Result.Failed(new Error(`Delivery ${input.deliveryId} is not assigned to courier ${input.courierId}`));
      }

      const pickedUp = delivery.markAsPickedUp();
      await this.deliveryRepository.update(pickedUp);
      return Result.Success({ delivery: pickedUp });
    } catch (error) {
      if (
        error instanceof DeliveryNotFoundError ||
        error instanceof DeliveryAlreadyPickedUpError ||
        error instanceof DeliveryAlreadyCompletedError ||
        error instanceof DeliveryNotReadyForPickupError
      ) {
        return Result.Failed(error);
      }

      return Result.Failed(
        new Error(`Failed to pickup delivery: ${(error as Error).message}`),
      );
    }
  }
}