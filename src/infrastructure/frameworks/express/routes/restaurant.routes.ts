import { Router, Request, Response } from 'express';
import { RestaurantController } from '@interface/controllers/restaurant.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { authMiddleware } from '../middlewares/auth.middleware';

export function restaurantRouter(controller: RestaurantController, authGuard: AuthGuard): Router {
  const router = Router();
  const ownerGuard = authMiddleware(authGuard, 'RESTAURATEUR');

  router.get('/', async (_req: Request, res: Response) => {
    const response = await controller.handleListRestaurants();
    res.status(response.statusCode).json(response.data);
  });

  router.get('/dishes', async (_req: Request, res: Response) => {
    const response = await controller.handleListAllDishes();
    res.status(response.statusCode).json(response.data);
  });

  router.get('/categories', async (_req: Request, res: Response) => {
    const response = await controller.handleListCategories();
    res.status(response.statusCode).json(response.data);
  });

  router.get('/offers', async (_req: Request, res: Response) => {
    const response = await controller.handleListOffers();
    res.status(response.statusCode).json(response.data);
  });

  router.get('/me/restaurant', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleGetMyRestaurant(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.patch('/me/restaurant', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleUpdateMyRestaurant(req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/me/offers', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleListMyOffers(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/me/offers', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleAddOffer(req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/me/dishes', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleListMyDishes(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/me/dishes', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleAddDish(req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.patch('/me/dishes/:dishId', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleUpdateDish(req.params['dishId'] as string, req.userId!, req.body);
    res.status(response.statusCode).json(response.data);
  });

  router.delete('/me/dishes/:dishId', ownerGuard, async (req: Request, res: Response) => {
    const response = await controller.handleDeleteDish(req.params['dishId'] as string, req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const response = await controller.handleGetRestaurantById(req.params['id'] as string);
    res.status(response.statusCode).json(response.data);
  });

  router.get('/:id/dishes', async (req: Request, res: Response) => {
    const response = await controller.handleListDishesByRestaurant(req.params['id'] as string);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}
