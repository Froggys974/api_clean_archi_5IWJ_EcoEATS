import { ListAvailableDeliveriesUseCase } from '@application/usecases/delivery/list-available-deliveries.use-case';
import { ListMyDeliveriesUseCase } from '@application/usecases/delivery/list-my-deliveries.use-case';
import { AcceptDeliveryUseCase } from '@application/usecases/delivery/accept-delivery.use-case';
import { CompleteDeliveryUseCase } from '@application/usecases/delivery/complete-delivery.use-case';
import { PickupDeliveryUseCase } from '@application/usecases/delivery/pickup-delivery.use-case';
import { SetCourierAvailabilityUseCase } from '@application/usecases/delivery/set-courier-availability.use-case';
import { DeliveryPresenter } from '@interface/presenters/delivery.presenter';
import { ControllerResponse, ErrorResponse } from '@interface/shared/controller-response';

export class DeliveryController {
  constructor(
    private readonly listAvailable: ListAvailableDeliveriesUseCase,
    private readonly listMine: ListMyDeliveriesUseCase,
    private readonly acceptDelivery: AcceptDeliveryUseCase,
    private readonly completeDelivery: CompleteDeliveryUseCase,
    private readonly pickupDelivery: PickupDeliveryUseCase,
    private readonly setCourierAvailability: SetCourierAvailabilityUseCase,
  ) {}

  async handleListAvailable(): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listAvailable.execute();
    if (!result.success) return { statusCode: 500, data: DeliveryPresenter.error(result.error.message) };
    return { statusCode: 200, data: DeliveryPresenter.deliveries(result.data.deliveries) };
  }

  async handleListMine(courierId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listMine.execute(courierId);
    if (!result.success) return { statusCode: 500, data: DeliveryPresenter.error(result.error.message) };
    return { statusCode: 200, data: DeliveryPresenter.deliveries(result.data.deliveries) };
  }

  async handleAccept(deliveryId: string, courierId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.acceptDelivery.execute({ deliveryId, courierId });
    if (!result.success) return { statusCode: 400, data: DeliveryPresenter.error(result.error.message) };
    return { statusCode: 200, data: DeliveryPresenter.delivery(result.data.delivery) };
  }

  async handleComplete(deliveryId: string, courierId: string, deliveryCode: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    if (!deliveryCode) return { statusCode: 400, data: DeliveryPresenter.error('Delivery code is required') };
    const result = await this.completeDelivery.execute({ deliveryId, courierId, deliveryCode });
    if (!result.success) return { statusCode: 400, data: DeliveryPresenter.error(result.error.message) };
    return { statusCode: 200, data: { message: 'Delivery completed successfully' } };
  }

  async handlePickup(deliveryId: string, courierId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.pickupDelivery.execute({ deliveryId, courierId });
    if (!result.success) return { statusCode: 400, data: DeliveryPresenter.error(result.error.message) };
    return { statusCode: 200, data: DeliveryPresenter.delivery(result.data.delivery) };
  }

  async handleSetAvailability(courierId: string, available: boolean): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.setCourierAvailability.execute({ courierId, available });
    if (!result.success) return { statusCode: 400, data: DeliveryPresenter.error(result.error.message) };
    return { statusCode: 200, data: { available: result.data.profile.status === 'AVAILABLE' } };
  }
}
