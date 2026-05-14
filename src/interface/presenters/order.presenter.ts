import { Order } from '@domain/entities/order/order.entity';

export class OrderPresenter {
  static order(o: Order) {
    return {
      id: o.id,
      clientId: o.clientId,
      restaurantId: o.restaurantId,
      status: o.status,
      isPaid: o.isPaid,
      items: o.items.map(item => ({
        id: item.id,
        dishId: item.dishId,
        dishName: item.dishName,
        dishPrice: item.dishPrice.getAmount(),
        quantity: item.quantity,
        totalPrice: item.getTotalPrice().getAmount(),
        specialInstructions: item.specialInstructions ?? null,
      })),
      deliveryAddress: {
        street: o.deliveryAddress.getStreet(),
        city: o.deliveryAddress.getCity(),
        postalCode: o.deliveryAddress.getPostalCode(),
        country: o.deliveryAddress.getCountry(),
      },
      deliveryCode: o.deliveryCode,
      itemsTotal: o.itemsTotal.getAmount(),
      deliveryFee: o.deliveryFee.getAmount(),
      serviceFee: o.serviceFee.getAmount(),
      totalPrice: o.totalPrice.getAmount(),
      preparationTimeMinutes: o.preparationTimeMinutes ?? null,
      estimatedDeliveryTime: o.getEstimatedDeliveryTime() ?? null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }

  static orders(list: Order[]) {
    return list.map(OrderPresenter.order);
  }

  static error(message: string) {
    return { message };
  }
}
