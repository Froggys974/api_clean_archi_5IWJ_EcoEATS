import { Price } from '@domain/value-objects/price.value-object';
import { Address } from '@domain/value-objects/address.value-object';

export type InvoiceLineItem = {
  id: string;
  dishName: string;
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
};

type CreateInvoiceProps = {
  id: string;
  orderId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientAddress: Address;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: Address;
  lineItems: InvoiceLineItem[];
  itemsSubtotal: Price;
  deliveryFee: Price;
  serviceFee: Price;
  totalAmount: Price;
  taxRate?: number;
  taxAmount?: Price;
  paymentMethod?: string;
  paymentId?: string;
  isPaid?: boolean;
  paidAt?: Date;
  createdAt?: Date;
};

export class Invoice {
  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly invoiceNumber: string,
    public readonly clientId: string,
    public readonly clientName: string,
    public readonly clientAddress: Address,
    public readonly restaurantId: string,
    public readonly restaurantName: string,
    public readonly restaurantAddress: Address,
    public readonly lineItems: InvoiceLineItem[],
    public readonly itemsSubtotal: Price,
    public readonly deliveryFee: Price,
    public readonly serviceFee: Price,
    public readonly totalAmount: Price,
    public readonly taxRate: number,
    public readonly taxAmount: Price,
    public readonly paymentMethod: string | undefined,
    public readonly paymentId: string | undefined,
    public readonly isPaid: boolean,
    public readonly paidAt: Date | undefined,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  static create(props: CreateInvoiceProps): Invoice {
    return new Invoice(
      props.id,
      props.orderId,
      props.invoiceNumber,
      props.clientId,
      props.clientName,
      props.clientAddress,
      props.restaurantId,
      props.restaurantName,
      props.restaurantAddress,
      props.lineItems,
      props.itemsSubtotal,
      props.deliveryFee,
      props.serviceFee,
      props.totalAmount,
      props.taxRate ?? 0,
      props.taxAmount ?? Price.zero(),
      props.paymentMethod,
      props.paymentId,
      props.isPaid ?? false,
      props.paidAt,
      props.createdAt ?? new Date()
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Invoice id is required');
    }

    if (!this.orderId || this.orderId.trim().length === 0) {
      throw new Error('Order id is required');
    }

    if (!this.invoiceNumber || this.invoiceNumber.trim().length === 0) {
      throw new Error('Invoice number is required');
    }

    if (!this.clientId || this.clientId.trim().length === 0) {
      throw new Error('Client id is required');
    }

    if (!this.clientName || this.clientName.trim().length === 0) {
      throw new Error('Client name is required');
    }

    if (!this.restaurantId || this.restaurantId.trim().length === 0) {
      throw new Error('Restaurant id is required');
    }

    if (!this.restaurantName || this.restaurantName.trim().length === 0) {
      throw new Error('Restaurant name is required');
    }

    if (this.lineItems.length === 0) {
      throw new Error('Invoice must have at least one line item');
    }

    if (this.taxRate < 0 || this.taxRate > 1) {
      throw new Error('Tax rate must be between 0 and 1 (0% to 100%)');
    }

    if (this.totalAmount.getAmount() <= 0) {
      throw new Error('Invoice total amount must be positive');
    }
  }

  markAsPaid(paymentId: string, paymentMethod: string): Invoice {
    if (this.isPaid) {
      throw new Error('Invoice is already paid');
    }

    return new Invoice(
      this.id,
      this.orderId,
      this.invoiceNumber,
      this.clientId,
      this.clientName,
      this.clientAddress,
      this.restaurantId,
      this.restaurantName,
      this.restaurantAddress,
      this.lineItems,
      this.itemsSubtotal,
      this.deliveryFee,
      this.serviceFee,
      this.totalAmount,
      this.taxRate,
      this.taxAmount,
      paymentMethod,
      paymentId,
      true,
      new Date(),
      this.createdAt
    );
  }

  getFormattedInvoiceNumber(): string {
    return `INV-${this.invoiceNumber}`;
  }

  getTotalItems(): number {
    return this.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  belongsToClient(clientId: string): boolean {
    return this.clientId === clientId;
  }

  belongsToRestaurant(restaurantId: string): boolean {
    return this.restaurantId === restaurantId;
  }

  belongsToOrder(orderId: string): boolean {
    return this.orderId === orderId;
  }

  /**
   * Generate a detailed invoice breakdown as a formatted string
   */
  getDetailedBreakdown(): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push(`INVOICE ${this.getFormattedInvoiceNumber()}`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Date: ${this.createdAt.toLocaleString()}`);
    lines.push(`Order ID: ${this.orderId}`);
    lines.push(`Payment Status: ${this.isPaid ? 'PAID' : 'UNPAID'}`);
    if (this.isPaid && this.paidAt) {
      lines.push(`Paid At: ${this.paidAt.toLocaleString()}`);
      lines.push(`Payment Method: ${this.paymentMethod ?? 'N/A'}`);
    }
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('CLIENT INFORMATION');
    lines.push('-'.repeat(60));
    lines.push(`Name: ${this.clientName}`);
    lines.push(`Address: ${this.clientAddress.getFullAddress()}`);
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('RESTAURANT INFORMATION');
    lines.push('-'.repeat(60));
    lines.push(`Name: ${this.restaurantName}`);
    lines.push(`Address: ${this.restaurantAddress.getFullAddress()}`);
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('LINE ITEMS');
    lines.push('-'.repeat(60));

    for (const item of this.lineItems) {
      lines.push(
        `${item.dishName} x ${item.quantity} @ ${item.unitPrice.toString()} = ${item.totalPrice.toString()}`
      );
    }

    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('PRICING BREAKDOWN');
    lines.push('-'.repeat(60));
    lines.push(`Items Subtotal: ${this.itemsSubtotal.toString()}`);
    lines.push(`Delivery Fee: ${this.deliveryFee.toString()}`);
    lines.push(`Service Fee: ${this.serviceFee.toString()}`);

    if (this.taxAmount.getAmount() > 0) {
      lines.push(
        `Tax (${(this.taxRate * 100).toFixed(2)}%): ${this.taxAmount.toString()}`
      );
    }

    lines.push('');
    lines.push(`TOTAL: ${this.totalAmount.toString()}`);
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * Generate a summary object for API responses
   */
  toSummary(): {
    id: string;
    invoiceNumber: string;
    orderId: string;
    totalAmount: string;
    isPaid: boolean;
    createdAt: Date;
  } {
    return {
      id: this.id,
      invoiceNumber: this.getFormattedInvoiceNumber(),
      orderId: this.orderId,
      totalAmount: this.totalAmount.toString(),
      isPaid: this.isPaid,
      createdAt: this.createdAt,
    };
  }
}
