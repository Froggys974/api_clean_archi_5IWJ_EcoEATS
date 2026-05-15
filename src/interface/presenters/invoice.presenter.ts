import { Invoice } from '@domain/entities/order/invoice.entity';

export class InvoicePresenter {
  static invoice(inv: Invoice) {
    return {
      id: inv.id,
      invoiceNumber: inv.getFormattedInvoiceNumber(),
      orderId: inv.orderId,
      clientName: inv.clientName,
      restaurantName: inv.restaurantName,
      lineItems: inv.lineItems.map((item) => ({
        id: item.id,
        dishName: item.dishName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.getAmount(),
        totalPrice: item.totalPrice.getAmount(),
      })),
      itemsSubtotal: inv.itemsSubtotal.getAmount(),
      deliveryFee: inv.deliveryFee.getAmount(),
      serviceFee: inv.serviceFee.getAmount(),
      tipAmount: inv.tipAmount.getAmount(),
      totalAmount: inv.totalAmount.getAmount(),
      paymentMethod: inv.paymentMethod ?? null,
      isPaid: inv.isPaid,
      paidAt: inv.paidAt ?? null,
      createdAt: inv.createdAt,
    };
  }

  static error(message: string) {
    return { message };
  }
}
