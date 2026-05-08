import { Router, Request, Response } from 'express';
import { OrderController } from '@interface/controllers/order.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { authMiddleware } from '../middlewares/auth.middleware';

export function orderRouter(controller: OrderController, authGuard: AuthGuard): Router {
  const router = Router();
  const clientGuard = authMiddleware(authGuard, 'CLIENT');
  const ownerGuard = authMiddleware(authGuard, 'RESTAURATEUR');

  router.post('/checkout', clientGuard, async (req: Request, res: Response) => {
    const response = await controller.handleCheckout(req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/mine', clientGuard, async (req: Request, res: Response) => {
    const response = await controller.handleListMyOrders(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/restaurant', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleListRestaurantOrders(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/:orderId', clientGuard, async (req: Request, res: Response) => {
    const response = await controller.handleGetOrderById(req.params['orderId'] as string, req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/:orderId/accept', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleAcceptOrder(req.params['orderId'] as string, req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/:orderId/refuse', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleRefuseOrder(req.params['orderId'] as string, req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/:orderId/ready', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleMarkOrderReady(req.params['orderId'] as string, req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}
