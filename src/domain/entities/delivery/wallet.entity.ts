import { Price } from '@domain/value-objects/price.value-object';

export type WalletTransactionType = 'DELIVERY_EARNING' | 'WITHDRAWAL' | 'ADJUSTMENT';

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  amount: Price;
  description: string;
  deliveryId?: string;
  createdAt: Date;
};

type CreateWalletProps = {
  id: string;
  courierId: string;
  balance: Price;
  transactions?: WalletTransaction[];
  createdAt?: Date;
  updatedAt?: Date;
};

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly courierId: string,
    public readonly balance: Price,
    public readonly transactions: WalletTransaction[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  static create(props: CreateWalletProps): Wallet {
    return new Wallet(
      props.id,
      props.courierId,
      props.balance,
      props.transactions ?? [],
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Wallet id is required');
    }

    if (!this.courierId || this.courierId.trim().length === 0) {
      throw new Error('Courier id is required');
    }

    if (this.balance.getAmount() < 0) {
      throw new Error('Wallet balance cannot be negative');
    }
  }

  addDeliveryEarning(
    transactionId: string,
    amount: Price,
    deliveryId: string
  ): Wallet {
    if (amount.getAmount() <= 0) {
      throw new Error('Delivery earning amount must be positive');
    }

    const newBalanceResult = this.balance.add(amount);
    if (!newBalanceResult.success) {
      throw newBalanceResult.error;
    }

    const transaction: WalletTransaction = {
      id: transactionId,
      type: 'DELIVERY_EARNING',
      amount,
      description: `Earnings from delivery ${deliveryId}`,
      deliveryId,
      createdAt: new Date(),
    };

    return new Wallet(
      this.id,
      this.courierId,
      newBalanceResult.data,
      [...this.transactions, transaction],
      this.createdAt,
      new Date()
    );
  }

  withdraw(transactionId: string, amount: Price, description?: string): Wallet {
    if (amount.getAmount() <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (amount.greaterThan(this.balance)) {
      throw new Error(
        `Insufficient balance. Available: ${this.balance.toString()}, Requested: ${amount.toString()}`
      );
    }

    const newBalanceResult = this.balance.subtract(amount);
    if (!newBalanceResult.success) {
      throw newBalanceResult.error;
    }

    const transaction: WalletTransaction = {
      id: transactionId,
      type: 'WITHDRAWAL',
      amount,
      description: description ?? 'Withdrawal',
      createdAt: new Date(),
    };

    return new Wallet(
      this.id,
      this.courierId,
      newBalanceResult.data,
      [...this.transactions, transaction],
      this.createdAt,
      new Date()
    );
  }

  adjust(transactionId: string, amount: Price, description: string): Wallet {
    if (amount.getAmount() === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    let newBalance: Price;

    if (amount.getAmount() > 0) {
      const result = this.balance.add(amount);
      if (!result.success) {
        throw result.error;
      }
      newBalance = result.data;
    } else {
      const positiveAmount = Price.create(Math.abs(amount.getAmount()));
      if (!positiveAmount.success) {
        throw positiveAmount.error;
      }

      const result = this.balance.subtract(positiveAmount.data);
      if (!result.success) {
        throw result.error;
      }
      newBalance = result.data;
    }

    const transaction: WalletTransaction = {
      id: transactionId,
      type: 'ADJUSTMENT',
      amount,
      description,
      createdAt: new Date(),
    };

    return new Wallet(
      this.id,
      this.courierId,
      newBalance,
      [...this.transactions, transaction],
      this.createdAt,
      new Date()
    );
  }

  getBalance(): Price {
    return this.balance;
  }

  getTotalEarnings(): Price {
    let total = Price.zero();

    for (const transaction of this.transactions) {
      if (transaction.type === 'DELIVERY_EARNING') {
        const result = total.add(transaction.amount);
        if (!result.success) {
          throw result.error;
        }
        total = result.data;
      }
    }

    return total;
  }

  getTotalWithdrawals(): Price {
    let total = Price.zero();

    for (const transaction of this.transactions) {
      if (transaction.type === 'WITHDRAWAL') {
        const result = total.add(transaction.amount);
        if (!result.success) {
          throw result.error;
        }
        total = result.data;
      }
    }

    return total;
  }

  getTransactionsByType(type: WalletTransactionType): WalletTransaction[] {
    return this.transactions.filter((t) => t.type === type);
  }

  getRecentTransactions(limit: number = 10): WalletTransaction[] {
    return [...this.transactions]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  belongsToCourier(courierId: string): boolean {
    return this.courierId === courierId;
  }

  canWithdraw(amount: Price): boolean {
    return !amount.greaterThan(this.balance) && amount.getAmount() > 0;
  }
}
