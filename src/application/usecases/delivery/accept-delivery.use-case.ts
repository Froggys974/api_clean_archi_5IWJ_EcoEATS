import { Result, ResultType } from "@domain/shared/result";
import { Delivery } from "@domain/entities/delivery/delivery.entity";
import { CourierProfile } from "@domain/entities/user/courier-profile.entity";
import { DeliveryRepository } from "@application/repositories/delivery.repository";
import { CourierProfileRepository } from "@application/repositories/courier-profile.repository";
import { RestaurantRepository } from "@application/repositories/restaurant.repository";
import { NotificationPort } from "@application/ports/notification.port";
import { LoggerPort } from "@application/ports/logger.port";
import {
  DeliveryNotFoundError,
  DeliveryAlreadyAcceptedError,
  CourierNotAvailableError,
  CourierAlreadyHasActiveDeliveryError,
  CourierCannotAcceptMultipleDeliveriesError,
  DeliveriesNotFromSameRestaurantError,
} from "@domain/errors/delivery.errors";

const ESTIMATED_MINUTES_PER_KM = 3;
const BASE_DELIVERY_MINUTES = 15;

export type AcceptDeliveryInput = {
  deliveryId: string;
  courierId: string;
};

export type AcceptDeliveryOutput = {
  delivery: Delivery;
  courierProfile: CourierProfile;
  estimatedDeliveryTime: Date;
};

export class AcceptDeliveryUseCase {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly courierProfileRepository: CourierProfileRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly notificationService: NotificationPort,
    private readonly logger: LoggerPort,
  ) {}

  async execute(
    input: AcceptDeliveryInput,
  ): Promise<ResultType<AcceptDeliveryOutput, Error>> {
    try {
      const delivery = await this.deliveryRepository.findById(input.deliveryId);
      if (!delivery) {
        return Result.Failed(new DeliveryNotFoundError(input.deliveryId));
      }

      if (delivery.status === "ACCEPTED" || delivery.status === "PICKED_UP") {
        return Result.Failed(
          new DeliveryAlreadyAcceptedError(input.deliveryId),
        );
      }

      const courierProfile = await this.courierProfileRepository.findByUserId(
        input.courierId,
      );
      if (!courierProfile) {
        return Result.Failed(
          new Error(`Courier profile not found for user ${input.courierId}`),
        );
      }

      if (courierProfile.status !== "AVAILABLE") {
        return Result.Failed(new CourierNotAvailableError(input.courierId));
      }

      const activeDeliveries =
        await this.deliveryRepository.findActiveByCourierId(input.courierId);

      if (courierProfile.isStandard() && activeDeliveries.length > 0) {
        return Result.Failed(
          new CourierAlreadyHasActiveDeliveryError(input.courierId),
        );
      }

      if (courierProfile.isExpert()) {
        if (activeDeliveries.length >= 2) {
          return Result.Failed(
            new CourierCannotAcceptMultipleDeliveriesError(input.courierId),
          );
        }

        if (activeDeliveries.length === 1) {
          const existingDelivery = activeDeliveries[0];
          if (!existingDelivery) {
            return Result.Failed(
              new Error("Active delivery not found in array"),
            );
          }
          if (existingDelivery.restaurantId !== delivery.restaurantId) {
            return Result.Failed(
              new DeliveriesNotFromSameRestaurantError(
                existingDelivery.restaurantId,
                delivery.restaurantId,
              ),
            );
          }
        }
      }

      let acceptedDelivery = delivery;

      if (!delivery.courierId) {
        acceptedDelivery = delivery.assignToCourier(input.courierId);
      }

      acceptedDelivery = acceptedDelivery.accept();

      const updatedCourierProfile = courierProfile.incrementActiveDeliveries();

      const estimatedDeliveryTime = new Date();
      const estimatedMinutes =
        Math.ceil(delivery.distance.getKilometers() * ESTIMATED_MINUTES_PER_KM) + BASE_DELIVERY_MINUTES;
      estimatedDeliveryTime.setMinutes(
        estimatedDeliveryTime.getMinutes() + estimatedMinutes,
      );

      await this.deliveryRepository.update(acceptedDelivery);
      await this.courierProfileRepository.update(updatedCourierProfile);

      try {
        const restaurant = await this.restaurantRepository.findById(
          delivery.restaurantId,
        );
        if (restaurant) {
          await this.notificationService.notifyCourierAboutDelivery(
            acceptedDelivery,
            "DELIVERY_ACCEPTED",
            input.courierId,
            courierProfile.user.email.getValue(),
            courierProfile.phone.getValue(),
          );
        }
      } catch (notificationError) {
        this.logger.error('Failed to send notifications', notificationError, 'AcceptDeliveryUseCase');
      }

      return Result.Success({
        delivery: acceptedDelivery,
        courierProfile: updatedCourierProfile,
        estimatedDeliveryTime,
      });
    } catch (error) {
      if (
        error instanceof DeliveryNotFoundError ||
        error instanceof DeliveryAlreadyAcceptedError ||
        error instanceof CourierNotAvailableError ||
        error instanceof CourierAlreadyHasActiveDeliveryError ||
        error instanceof CourierCannotAcceptMultipleDeliveriesError ||
        error instanceof DeliveriesNotFromSameRestaurantError
      ) {
        return Result.Failed(error);
      }

      return Result.Failed(
        new Error(`Failed to accept delivery: ${(error as Error).message}`),
      );
    }
  }
}
