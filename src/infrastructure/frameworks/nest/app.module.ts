import { Module } from '@nestjs/common';
import { CompositionModule } from './composition.module';
import { AuthNestController } from './controllers/auth.nest-controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { AuthenticatedNestGuard } from './guards/auth.nest-guard';

@Module({
  imports: [CompositionModule],
  controllers: [AuthNestController],
  providers: [
    { provide: AuthenticatedNestGuard, useFactory: (g: AuthGuard) => new AuthenticatedNestGuard(g), inject: [AuthGuard] },
  ],
})
export class AppModule {}
