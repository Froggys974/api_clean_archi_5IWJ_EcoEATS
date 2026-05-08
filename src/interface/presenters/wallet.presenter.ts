import { Wallet } from '@domain/entities/delivery/wallet.entity';

export class WalletPresenter {
  static wallet(w: Wallet) {
    return {
      id: w.id,
      courierId: w.courierId,
      balance: w.getBalance().getAmount(),
      currency: w.getBalance().getCurrency(),
      totalEarnings: w.getTotalEarnings().getAmount(),
      transactions: w.getRecentTransactions(20).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.getAmount(),
        description: t.description,
        deliveryId: t.deliveryId ?? null,
        createdAt: t.createdAt,
      })),
    };
  }

  static error(message: string) {
    return { message };
  }
}
