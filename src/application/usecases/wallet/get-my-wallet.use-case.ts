import { Result, ResultType } from '@domain/shared/result';
import { Wallet } from '@domain/entities/delivery/wallet.entity';
import { Price } from '@domain/value-objects/price.value-object';
import { WalletRepository } from '@application/repositories/wallet.repository';

export type GetMyWalletOutput = { wallet: Wallet };

export class GetMyWalletUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(courierId: string): Promise<ResultType<GetMyWalletOutput, Error>> {
    let wallet = await this.walletRepository.findByCourierId(courierId);

    if (!wallet) {
      wallet = Wallet.create({
        id: crypto.randomUUID(),
        courierId,
        balance: Price.zero(),
      });
      await this.walletRepository.create(wallet);
    }

    return Result.Success({ wallet });
  }
}
