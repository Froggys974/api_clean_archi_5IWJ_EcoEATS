import { Controller, Get, Post, Delete, Patch, Param, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { CartController } from '@interface/controllers/cart.controller';
import { ClientNestGuard } from '../guards/auth.nest-guard';
import { resolveResponse } from '../nest-http.helper';

@Controller('cart')
@UseGuards(ClientNestGuard)
export class CartNestController {
  constructor(private readonly controller: CartController) {}

  @Get()
  async getCart(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleGetCart(req.userId));
  }

  @Post('items')
  @HttpCode(201)
  async addItem(@Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleAddItem(req.userId, dto as never));
  }

  @Delete('items/:dishId')
  async removeItem(@Req() req: { userId: string }, @Param('dishId') dishId: string) {
    return resolveResponse(await this.controller.handleRemoveItem(req.userId, dishId));
  }

  @Delete()
  async clearCart(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleClearCart(req.userId));
  }

  @Patch('items/:dishId')
  async updateItemQuantity(
    @Req() req: { userId: string },
    @Param('dishId') dishId: string,
    @Body('quantity') quantity: number,
  ) {
    return resolveResponse(await this.controller.handleUpdateItemQuantity(req.userId, dishId, quantity));
  }
}
