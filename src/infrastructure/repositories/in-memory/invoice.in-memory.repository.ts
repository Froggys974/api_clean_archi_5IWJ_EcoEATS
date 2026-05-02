import { Invoice } from '@domain/entities/order/invoice.entity';
import { InvoiceRepository } from '@application/repositories/invoice.repository';

export class InvoiceInMemoryRepository implements InvoiceRepository {
  private readonly invoices = new Map<string, Invoice>();
  private invoiceCounter = 1;

  async findById(id: string): Promise<Invoice | null> {
    return this.invoices.get(id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    return Array.from(this.invoices.values()).find(i => i.orderId === orderId) ?? null;
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => i.clientId === clientId);
  }

  async findByRestaurantId(restaurantId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => i.restaurantId === restaurantId);
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return Array.from(this.invoices.values()).find(i => i.invoiceNumber === invoiceNumber) ?? null;
  }

  async findPaidInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => i.isPaid);
  }

  async findUnpaidInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => !i.isPaid);
  }

  async findAll(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async create(invoice: Invoice): Promise<void> {
    this.invoices.set(invoice.id, invoice);
  }

  async update(invoice: Invoice): Promise<void> {
    if (!this.invoices.has(invoice.id)) return;
    this.invoices.set(invoice.id, invoice);
  }

  async delete(id: string): Promise<void> {
    this.invoices.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.invoices.has(id);
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const number = String(this.invoiceCounter++).padStart(6, '0');
    return `INV-${year}-${number}`;
  }
}
