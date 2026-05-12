import { Router, Request, Response } from 'express';
import { WalletController } from '@interface/controllers/wallet.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { authMiddleware } from '../middlewares/auth.middleware';

export function walletRouter(controller: WalletController, authGuard: AuthGuard): Router {
  const router = Router();
  const courierGuard = authMiddleware(authGuard, 'COURIER');

  router.get('/mine', courierGuard, async (req: Request, res: Response) => {
    const response = await controller.handleGetMyWallet(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}
