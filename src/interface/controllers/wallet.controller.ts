import { GetMyWalletUseCase } from '@application/usecases/wallet/get-my-wallet.use-case';
import { WalletPresenter } from '@interface/presenters/wallet.presenter';
import { ControllerResponse, ErrorResponse } from '@interface/shared/controller-response';

export class WalletController {
  constructor(private readonly getMyWallet: GetMyWalletUseCase) {}

  async handleGetMyWallet(courierId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.getMyWallet.execute(courierId);
    if (!result.success) return { statusCode: 500, data: WalletPresenter.error(result.error.message) };
    return { statusCode: 200, data: WalletPresenter.wallet(result.data.wallet) };
  }
}
