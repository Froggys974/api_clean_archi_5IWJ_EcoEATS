import express, { Express } from 'express';
import { Composition } from './composition';
import { authRouter } from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export function createApp({ authController, authGuard }: Composition): Express {
  const app = express();

  app.use(express.json());

  app.use('/auth', authRouter(authController));

  app.use(errorMiddleware);

  return app;
}