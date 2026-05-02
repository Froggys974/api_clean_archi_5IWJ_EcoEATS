import { Wallet } from '@domain/entities/delivery/wallet.entity';
import { WalletRepository } from '@application/repositories/wallet.repository';

export class WalletInMemoryRepository implements WalletRepository {
  private readonly wallets = new Map<string, Wallet>();

  async findById(id: string): Promise<Wallet | null> {
    return this.wallets.get(id) ?? null;
  }

  async findByCourierId(courierId: string): Promise<Wallet | null> {
    return Array.from(this.wallets.values()).find(w => w.courierId === courierId) ?? null;
  }

  async findAll(): Promise<Wallet[]> {
    return Array.from(this.wallets.values());
  }

  async create(wallet: Wallet): Promise<void> {
    this.wallets.set(wallet.id, wallet);
  }

  async update(wallet: Wallet): Promise<void> {
    if (!this.wallets.has(wallet.id)) return;
    this.wallets.set(wallet.id, wallet);
  }

  async delete(id: string): Promise<void> {
    this.wallets.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.wallets.has(id);
  }

  async existsByCourierId(courierId: string): Promise<boolean> {
    return Array.from(this.wallets.values()).some(w => w.courierId === courierId);
  }
}
