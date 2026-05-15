import { Result, ResultType } from '@domain/shared/result';
import { Invoice } from '@domain/entities/order/invoice.entity';
import { InvoiceRepository } from '@application/repositories/invoice.repository';

export type GetInvoiceByOrderIdOutput = { invoice: Invoice };

export class GetInvoiceByOrderIdUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(
    orderId: string,
    clientId: string,
  ): Promise<ResultType<GetInvoiceByOrderIdOutput, Error>> {
    const invoice = await this.invoiceRepository.findByOrderId(orderId);

    if (!invoice) {
      return Result.Failed(new Error(`Invoice not found for order ${orderId}`));
    }

    if (!invoice.belongsToClient(clientId)) {
      return Result.Failed(new Error('You do not have access to this invoice'));
    }

    return Result.Success({ invoice });
  }
}
