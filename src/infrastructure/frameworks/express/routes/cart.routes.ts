import { Router, Request, Response } from 'express';
import { CartController } from '@interface/controllers/cart.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { authMiddleware } from '../middlewares/auth.middleware';

export function cartRouter(controller: CartController, authGuard: AuthGuard): Router {
  const router = Router();
  const guard = authMiddleware(authGuard, 'CLIENT');

  router.get('/', guard, async (req: Request, res: Response) => {
    const response = await controller.handleGetCart(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/items', guard, async (req: Request, res: Response) => {
    const response = await controller.handleAddItem(req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.patch('/items/:dishId', guard, async (req: Request, res: Response) => {
    const response = await controller.handleUpdateItemQuantity(req.userId!, req.params['dishId'] as string, req.body?.quantity);
    res.status(response.statusCode).json(response.data);
  });

  router.delete('/items/:dishId', guard, async (req: Request, res: Response) => {
    const response = await controller.handleRemoveItem(req.userId!, req.params['dishId'] as string);
    res.status(response.statusCode).json(response.data);
  });

  router.delete('/', guard, async (req: Request, res: Response) => {
    const response = await controller.handleClearCart(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}
