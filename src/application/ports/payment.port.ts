import { Price } from '@domain/value-objects/price.value-object';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentResult = {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  message?: string;
  transactionId?: string;
};

export type RefundResult = {
  success: boolean;
  refundId: string;
  amount: Price;
  message?: string;
};

export interface PaymentPort {
  /**
   * Process a payment for an order
   * @param orderId - The order ID
   * @param amount - The amount to charge
   * @param method - The payment method
   * @param customerId - The customer ID
   * @returns Payment result
   */
  processPayment(
    orderId: string,
    amount: Price,
    method: PaymentMethod,
    customerId: string
  ): Promise<PaymentResult>;

  /**
   * Verify a payment status
   * @param paymentId - The payment ID to verify
   * @returns Current payment status
   */
  verifyPayment(paymentId: string): Promise<PaymentStatus>;

  /**
   * Refund a payment
   * @param paymentId - The payment ID to refund
   * @param amount - The amount to refund (partial or full)
   * @param reason - The reason for refund
   * @returns Refund result
   */
  refundPayment(
    paymentId: string,
    amount: Price,
    reason?: string
  ): Promise<RefundResult>;

  /**
   * Get payment details
   * @param paymentId - The payment ID
   * @returns Payment details or null if not found
   */
  getPaymentDetails(paymentId: string): Promise<{
    id: string;
    orderId: string;
    amount: Price;
    method: PaymentMethod;
    status: PaymentStatus;
    createdAt: Date;
    completedAt?: Date;
  } | null>;
}
