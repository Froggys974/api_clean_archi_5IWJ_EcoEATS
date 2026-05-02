import { Delivery } from '@domain/entities/delivery/delivery.entity';

export class DeliveryPresenter {
  static delivery(d: Delivery) {
    return {
      id: d.id,
      orderId: d.orderId,
      restaurantId: d.restaurantId,
      courierId: d.courierId ?? null,
      status: d.status,
      deliveryFee: d.deliveryFee.getAmount(),
      tipAmount: d.tipAmount.getAmount(),
      distanceKm: d.distance.getKilometers(),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  static deliveries(list: Delivery[]) {
    return list.map(DeliveryPresenter.delivery);
  }

  static error(message: string) {
    return { message };
  }
}
