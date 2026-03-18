import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ConfigPort } from '@application/ports/config.port';
import { Composition } from './composition';
import { authRouter } from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export function createApp(
  { authController, authGuard }: Composition,
  config: ConfigPort
): Express {
  const app = express();

  app.use(morgan('dev'));

  const frontendUrl = config.get('FRONTEND_URL');
  if (frontendUrl) {
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || origin === frontendUrl) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
      })
    );
  } else {
    app.use(cors());
  }

  app.use(express.json());

  app.use('/auth', authRouter(authController));

  app.use(errorMiddleware);

  return app;
}