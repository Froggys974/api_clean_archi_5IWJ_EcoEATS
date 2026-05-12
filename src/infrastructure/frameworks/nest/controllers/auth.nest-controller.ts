import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthController } from '@interface/controllers/auth.controller';
import { resolveResponse } from '../nest-http.helper';

@Controller('auth')
export class AuthNestController {
  constructor(private readonly controller: AuthController) {}

  @Post('register/client')
  @HttpCode(201)
  async registerClient(@Body() dto: unknown) {
    return resolveResponse(await this.controller.registerClient(dto as never));
  }

  @Post('register/courier')
  @HttpCode(201)
  async registerCourier(@Body() dto: unknown) {
    return resolveResponse(await this.controller.registerCourier(dto as never));
  }

  @Post('register/restaurant-owner')
  @HttpCode(201)
  async registerRestaurantOwner(@Body() dto: unknown) {
    return resolveResponse(await this.controller.registerRestaurantOwner(dto as never));
  }

  @Post('login')
  async login(@Body() dto: unknown) {
    return resolveResponse(await this.controller.login(dto as never));
  }
}
