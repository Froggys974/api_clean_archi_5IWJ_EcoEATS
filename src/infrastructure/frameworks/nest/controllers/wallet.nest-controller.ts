import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { WalletController } from '@interface/controllers/wallet.controller';
import { CourierNestGuard } from '../guards/auth.nest-guard';
import { resolveResponse } from '../nest-http.helper';

@Controller('wallet')
@UseGuards(CourierNestGuard)
export class WalletNestController {
  constructor(private readonly controller: WalletController) {}

  @Get('mine')
  async getMyWallet(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleGetMyWallet(req.userId));
  }
}
