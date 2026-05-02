import { DotenvConfigService } from '@infrastructure/config/dotenv-config.service';
import { createComposition } from './composition';
import { createApp } from './app';

async function bootstrap() {
  const config = new DotenvConfigService();
  const composition = await createComposition(config);
  const app = createApp(composition, config);

  const PORT = config.get('PORT') || '3000';

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap();
