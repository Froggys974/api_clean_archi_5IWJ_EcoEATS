import { Wallet } from '@domain/entities/delivery/wallet.entity';

export interface WalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByCourierId(courierId: string): Promise<Wallet | null>;
  findAll(): Promise<Wallet[]>;
  create(wallet: Wallet): Promise<void>;
  update(wallet: Wallet): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByCourierId(courierId: string): Promise<boolean>;
}
