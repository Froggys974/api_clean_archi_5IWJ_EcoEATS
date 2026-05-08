import { Price } from '@domain/value-objects/price.value-object';
import { PaymentPort, PaymentMethod, PaymentResult, PaymentStatus, RefundResult } from '@application/ports/payment.port';

export class InMemoryPaymentService implements PaymentPort {
  async processPayment(
    orderId: string,
    _amount: Price,
    _method: PaymentMethod,
    _customerId: string,
  ): Promise<PaymentResult> {
    return {
      success: true,
      paymentId: `pay-${orderId}-${Date.now()}`,
      status: 'COMPLETED',
    };
  }

  async verifyPayment(_paymentId: string): Promise<PaymentStatus> {
    return 'COMPLETED';
  }

  async refundPayment(_paymentId: string, amount: Price, _reason?: string): Promise<RefundResult> {
    return {
      success: true,
      refundId: `refund-${Date.now()}`,
      amount,
    };
  }

  async getPaymentDetails(_paymentId: string) {
    return null;
  }
}
