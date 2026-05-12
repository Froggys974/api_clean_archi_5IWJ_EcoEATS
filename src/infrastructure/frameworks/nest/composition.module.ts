import { Module } from '@nestjs/common';
import { DotenvConfigService } from '@infrastructure/config/dotenv-config.service';
import { createComposition, Composition } from '@infrastructure/composition';
import { AuthController } from '@interface/controllers/auth.controller';
import { AuthGuard } from '@interface/guards/auth.guard';

@Module({
  providers: [
    {
      provide: DotenvConfigService,
      useClass: DotenvConfigService,
    },
    {
      provide: 'fileForComposition',
      useFactory: async (config: DotenvConfigService): Promise<Composition> => createComposition(config),
      inject: [DotenvConfigService],
    },
    { provide: AuthController, useFactory: (c: Composition) => c.authController, inject: ['fileForComposition'] },
    { provide: AuthGuard, useFactory: (c: Composition) => c.authGuard, inject: ['fileForComposition'] },
  ],
  exports: [AuthController, AuthGuard],
})
export class CompositionModule {}
