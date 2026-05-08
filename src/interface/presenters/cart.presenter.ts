import { Cart } from '@domain/entities/order/cart.entity';

export class CartPresenter {
  static cart(c: Cart) {
    return {
      id: c.id,
      clientId: c.clientId,
      restaurantId: c.restaurantId ?? null,
      isCheckedOut: c.isCheckedOut,
      items: c.items.map(item => ({
        id: item.id,
        dishId: item.dishId,
        dishName: item.dishName,
        dishPrice: item.dishPrice.getAmount(),
        quantity: item.quantity,
        totalPrice: item.getTotalPrice().getAmount(),
        specialInstructions: item.specialInstructions ?? null,
      })),
      totalPrice: c.getTotalPrice().getAmount(),
      totalItems: c.getTotalItems(),
      updatedAt: c.updatedAt,
    };
  }

  static error(message: string) {
    return { message };
  }
}
