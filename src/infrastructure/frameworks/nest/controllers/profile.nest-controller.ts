import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ProfileController } from '@interface/controllers/profile.controller';
import { AuthenticatedNestGuard } from '../guards/auth.nest-guard';
import { resolveResponse } from '../nest-http.helper';

@Controller('me')
export class ProfileNestController {
  constructor(private readonly controller: ProfileController) {}

  @Get()
  @UseGuards(AuthenticatedNestGuard)
  async getMe(@Req() req: { userId: string }) {
    return resolveResponse(await this.controller.handleGetMe(req.userId));
  }
}
