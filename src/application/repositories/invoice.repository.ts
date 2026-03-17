import { Invoice } from '@domain/entities/order/invoice.entity';

export interface InvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByOrderId(orderId: string): Promise<Invoice | null>;
  findByClientId(clientId: string): Promise<Invoice[]>;
  findByRestaurantId(restaurantId: string): Promise<Invoice[]>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findPaidInvoices(): Promise<Invoice[]>;
  findUnpaidInvoices(): Promise<Invoice[]>;
  findAll(): Promise<Invoice[]>;
  create(invoice: Invoice): Promise<void>;
  update(invoice: Invoice): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  generateInvoiceNumber(): Promise<string>;
}
