import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ConfigPort } from '@application/ports/config.port';
import { Composition } from './composition';
import { authRouter } from './routes/auth.routes';
import { profileRouter } from './routes/profile.routes';
import { restaurantRouter } from './routes/restaurant.routes';
import { cartRouter } from './routes/cart.routes';
import { orderRouter } from './routes/order.routes';
import { deliveryRouter } from './routes/delivery.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export function createApp(
  composition: Composition,
  config: ConfigPort
): Express {
  const { authController, profileController, restaurantController, cartController, orderController, deliveryController, walletController, authGuard } = composition;

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
  app.use('/me', profileRouter(profileController, authGuard));
  app.use('/restaurants', restaurantRouter(restaurantController, authGuard));
  app.use('/cart', cartRouter(cartController, authGuard));
  app.use('/orders', orderRouter(orderController, authGuard));
  app.use('/deliveries', deliveryRouter(deliveryController, walletController, authGuard));

  app.use(errorMiddleware);

  return app;
}
