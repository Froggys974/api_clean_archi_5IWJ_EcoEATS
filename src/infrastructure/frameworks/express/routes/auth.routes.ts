import { AuthController } from '@interface/controllers/auth.controller';
import { LoginDto, RegisterClientDto, RegisterCourierDto } from '@interface/dtos/auth.dto';
import { Router, Request, Response } from 'express';

export function authRouter(authController: AuthController): Router {
  const router = Router();

  router.post('/register/client', async (req: Request, res: Response) => {
    const inputClient: RegisterClientDto = req.body;
    const response = await authController.registerClient(inputClient);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/register/courier', async (req: Request, res: Response) => {
    const inputCourier: RegisterCourierDto = req.body;
    const response = await authController.registerCourier(inputCourier);
    res.status(response.statusCode).json(response.data);
  });

  router.post('/login', async (req: Request, res: Response) => {
    const loginInput: LoginDto = req.body;
    const response = await authController.login(loginInput);
    res.status(response.statusCode).json(response.data);
  });

  return router;
}