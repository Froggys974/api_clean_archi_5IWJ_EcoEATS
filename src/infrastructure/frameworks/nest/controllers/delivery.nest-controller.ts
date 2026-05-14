import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { DeliveryController } from '@interface/controllers/delivery.controller';
import { CourierNestGuard } from '../guards/auth.nest-guard';
import { resolveResponse } from '../nest-http.helper';

@Controller('deliveries')
@UseGuards(CourierNestGuard)
export class DeliveryNestController {
  constructor(private readonly controller: DeliveryController) {}

  @Get('available')
  async listAvailable() {
    return resolveResponse(await this.controller.handleListAvailable());
  }

  @Get('mine')
  async listMine(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleListMine(req.userId));
  }

  @Patch('availability')
  async setAvailability(@Req() req: { userId: string }, @Body('available') available: boolean) {
    return resolveResponse(await this.controller.handleSetAvailability(req.userId, available));
  }

  @Post(':deliveryId/accept')
  async accept(@Param('deliveryId') deliveryId: string, @Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleAccept(deliveryId, req.userId));
  }

  @Post(':deliveryId/pickup')
  async pickup(@Param('deliveryId') deliveryId: string, @Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handlePickup(deliveryId, req.userId));
  }

  @Post(':deliveryId/complete')
  async complete(@Param('deliveryId') deliveryId: string, @Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleComplete(deliveryId, req.userId));
  }
}
