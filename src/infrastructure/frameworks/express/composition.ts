import { ConfigPort } from '@application/ports/config.port';
import { HashService } from '@infrastructure/services/hash.service';
import { TokenService } from '@infrastructure/services/token.service';
import { UserInMemoryRepository } from '@infrastructure/repositories/in-memory/user.in-memory.repository';
import { ClientProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/client-profile.in-memory.repository';
import { CourierProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/courier-profile.in-memory.repository';
import { AuthController } from '@interface/controllers/auth.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { RegisterClient } from '@application/usecases/auth/register-client.use-case';
import { RegisterCourier } from '@application/usecases/auth/register-courier.use-case';
import { Login } from '@application/usecases/auth/login.use-case';

export type Composition = {
  authController: AuthController;
  authGuard: AuthGuard;
};

export function createComposition(config: ConfigPort): Composition {
  const hashService = new HashService(config);
  const tokenService = new TokenService(config);

  const userRepository = new UserInMemoryRepository();
  const clientProfileRepository = new ClientProfileInMemoryRepository();
  const courierProfileRepository = new CourierProfileInMemoryRepository();

  const registerClient = new RegisterClient(userRepository, clientProfileRepository, hashService);
  const registerCourier = new RegisterCourier(userRepository, courierProfileRepository, hashService);
  const login = new Login(userRepository, hashService, tokenService);

  const authController = new AuthController(registerClient, registerCourier, login);

  const authGuard = new AuthGuard(tokenService);

  return { authController, authGuard };
}