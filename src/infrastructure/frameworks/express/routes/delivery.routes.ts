import { Router, Request, Response } from 'express';
import { DeliveryController } from '@interface/controllers/delivery.controller';
import { WalletController } from '@interface/controllers/wallet.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { authMiddleware } from '../middlewares/auth.middleware';

export function deliveryRouter(
  deliveryController: DeliveryController,
  walletController: WalletController,
  authGuard: AuthGuard,
): Router {
  const router = Router();
  const courierGuard = authMiddleware(authGuard, 'COURIER');

  router.get('/available', courierGuard, async (_req: Request, res: Response) => {
    const response = await deliveryController.handleListAvailable();
    res.status(response.statusCode).json(response.data);
  });

  router.get('/mine', courierGuard, async (req: Request, res: Response) => {
    const response = await deliveryController.handleListMine(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/wallet', courierGuard, async (req: Request, res: Response) => {
    const response = await walletController.handleGetMyWallet(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.patch('/availability', courierGuard, async (req: Request, res: Response) => {
    const available = req.body?.available === true || req.body?.available === 'true';
    const response = await deliveryController.handleSetAvailability(req.userId!, available);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/:deliveryId/accept', courierGuard, async (req: Request, res: Response) => {
    const response = await deliveryController.handleAccept(req.params['deliveryId'] as string, req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/:deliveryId/pickup', courierGuard, async (req: Request, res: Response) => {
    const response = await deliveryController.handlePickup(req.params['deliveryId'] as string, req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/:deliveryId/complete', courierGuard, async (req: Request, res: Response) => {
    const response = await deliveryController.handleComplete(req.params['deliveryId'] as string, req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}
