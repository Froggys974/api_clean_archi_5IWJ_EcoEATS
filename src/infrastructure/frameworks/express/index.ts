import { DotenvConfigService } from '@infrastructure/config/dotenv-config.service';
import { createComposition } from './composition';
import { createApp } from './app';

const config = new DotenvConfigService();
const { authController, authGuard } = createComposition(config);
const app = createApp({ authController, authGuard });

const PORT = config.get('PORT') || '3000';

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});