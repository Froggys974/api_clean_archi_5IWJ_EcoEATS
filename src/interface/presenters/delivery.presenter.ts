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
      restaurantAddress: `${d.restaurantAddress.getStreet()}, ${d.restaurantAddress.getCity()}`,
      deliveryAddress: `${d.deliveryAddress.getStreet()}, ${d.deliveryAddress.getCity()}`,
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
