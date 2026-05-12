import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DotenvConfigService } from '@infrastructure/config/dotenv-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DotenvConfigService();
  const frontendUrl = config.get('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl || '*',
    credentials: true,
  });

  const port = parseInt(config.get('NEST_PORT') ?? '3004');
  await app.listen(port);
  console.log(`NestJS server running on port ${port}`);
}

bootstrap().catch(console.error);
