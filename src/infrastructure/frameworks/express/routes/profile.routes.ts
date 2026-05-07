import { Router, Request, Response } from 'express';
import { ProfileController } from '@interface/controllers/profile.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { authMiddleware } from '../middlewares/auth.middleware';

export function profileRouter(controller: ProfileController, authGuard: AuthGuard): Router {
  const router = Router();
  const guard = authMiddleware(authGuard);

  router.get('/', guard, async (req: Request, res: Response) => {
    const response = await controller.handleGetMe(req.userId!);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}
