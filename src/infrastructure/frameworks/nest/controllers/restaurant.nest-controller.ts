import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { RestaurantController } from '@interface/controllers/restaurant.controller';
import { OwnerNestGuard } from '../guards/auth.nest-guard';
import { resolveResponse } from '../nest-http.helper';

@Controller('restaurants')
export class RestaurantNestController {
  constructor(private readonly controller: RestaurantController) {}

  @Get()
  async listRestaurants() {
    return resolveResponse(await this.controller.handleListRestaurants());
  }

  @Get('categories')
  async listCategories() {
    return resolveResponse(await this.controller.handleListCategories());
  }

  @Get('offers')
  async listOffers() {
    return resolveResponse(await this.controller.handleListOffers());
  }

  @Get('dishes')
  async listAllDishes() {
    return resolveResponse(await this.controller.handleListAllDishes());
  }

  @Get('mine')
  @UseGuards(OwnerNestGuard)
  async getMyRestaurant(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleGetMyRestaurant(req.userId));
  }

  @Get('mine/dishes')
  @UseGuards(OwnerNestGuard)
  async listMyDishes(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleListMyDishes(req.userId));
  }

  @Get('mine/offers')
  @UseGuards(OwnerNestGuard)
  async listMyOffers(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleListMyOffers(req.userId));
  }

  @Patch('mine')
  @UseGuards(OwnerNestGuard)
  async updateMyRestaurant(@Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleUpdateMyRestaurant(req.userId, dto as never));
  }

  @Get(':restaurantId')
  async getRestaurantById(@Param('restaurantId') id: string) {
    return resolveResponse(await this.controller.handleGetRestaurantById(id));
  }

  @Get(':restaurantId/dishes')
  async listDishesByRestaurant(@Param('restaurantId') id: string) {
    return resolveResponse(await this.controller.handleListDishesByRestaurant(id));
  }

  @Post('mine/dishes')
  @UseGuards(OwnerNestGuard)
  @HttpCode(201)
  async addDish(@Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleAddDish(req.userId, dto as never));
  }

  @Patch('mine/dishes/:dishId')
  @UseGuards(OwnerNestGuard)
  async updateDish(@Param('dishId') dishId: string, @Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleUpdateDish(dishId, req.userId, dto as never));
  }

  @Delete('mine/dishes/:dishId')
  @UseGuards(OwnerNestGuard)
  async deleteDish(@Param('dishId') dishId: string, @Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleDeleteDish(dishId, req.userId));
  }

  @Post('mine/offers')
  @UseGuards(OwnerNestGuard)
  @HttpCode(201)
  async addOffer(@Req() req: { userId: string }, @Body() dto: unknown) {
    return resolveResponse(await this.controller.handleAddOffer(req.userId, dto as never));
  }
}
