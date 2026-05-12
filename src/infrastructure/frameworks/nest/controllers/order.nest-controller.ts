import { Controller, Get, Post, Param, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { OrderController } from '@interface/controllers/order.controller';
import { ClientNestGuard, OwnerNestGuard } from '../guards/auth.nest-guard';
import { resolveResponse } from '../nest-http.helper';

@Controller('orders')
export class OrderNestController {
  constructor(private readonly controller: OrderController) {}

  @Post('checkout')
  @UseGuards(ClientNestGuard)
  @HttpCode(201)
  async checkout(@Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleCheckout(req.userId, dto as never));
  }

  @Get('mine')
  @UseGuards(ClientNestGuard)
  async listMyOrders(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleListMyOrders(req.userId));
  }

  @Get('restaurant')
  @UseGuards(OwnerNestGuard)
  async listRestaurantOrders(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleListRestaurantOrders(req.userId));
  }

  @Get(':orderId')
  @UseGuards(ClientNestGuard)
  async getOrderById(@Param('orderId') orderId: string, @Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleGetOrderById(orderId, req.userId));
  }

  @Post(':orderId/accept')
  @UseGuards(OwnerNestGuard)
  async acceptOrder(@Param('orderId') orderId: string, @Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleAcceptOrder(orderId, req.userId, dto as never));
  }

  @Post(':orderId/refuse')
  @UseGuards(OwnerNestGuard)
  async refuseOrder(@Param('orderId') orderId: string, @Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleRefuseOrder(orderId, req.userId, dto as never));
  }

  @Post(':orderId/ready')
  @UseGuards(OwnerNestGuard)
  async markOrderReady(@Param('orderId') orderId: string, @Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleMarkOrderReady(orderId, req.userId));
  }
}
