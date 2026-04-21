import { ConfigPort } from '@application/ports/config.port';
import { HashService } from '@infrastructure/services/hash.service';
import { TokenService } from '@infrastructure/services/token.service';
import { UserInMemoryRepository } from '@infrastructure/repositories/in-memory/user.in-memory.repository';
import { ClientProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/client-profile.in-memory.repository';
import { CourierProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/courier-profile.in-memory.repository';
import { RestaurantOwnerProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/restaurant-owner-profile.in-memory.repository';
import { AuthController } from '@interface/controllers/auth.controller';
import { AuthGuard } from '@interface/guards/auth.guard';
import { RegisterClient } from '@application/usecases/auth/register-client.use-case';
import { RegisterCourier } from '@application/usecases/auth/register-courier.use-case';
import { RegisterRestaurantOwner } from '@application/usecases/auth/register-restaurant-owner.use-case';
import { Login } from '@application/usecases/auth/login.use-case';
import { User } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { RestaurantOwnerProfile } from '@domain/entities/user/restaurant-owner-profile.entity';

export type Composition = {
  authController: AuthController;
  authGuard: AuthGuard;
};

export async function createComposition(config: ConfigPort): Promise<Composition> {
  const hashService = new HashService(config);
  const tokenService = new TokenService(config);

  const userRepository = new UserInMemoryRepository();
  const clientProfileRepository = new ClientProfileInMemoryRepository();
  const courierProfileRepository = new CourierProfileInMemoryRepository();
  const restaurantOwnerProfileRepository = new RestaurantOwnerProfileInMemoryRepository();

  const registerClient = new RegisterClient(userRepository, clientProfileRepository, hashService);
  const registerCourier = new RegisterCourier(userRepository, courierProfileRepository, hashService);
  const registerRestaurantOwner = new RegisterRestaurantOwner(userRepository, restaurantOwnerProfileRepository, hashService);
  const login = new Login(userRepository, hashService, tokenService);

  // Seed users for testing
  const seedEmail = Email.create('toto@mail.fr');
  if (seedEmail.success) {
    userRepository.create(
      User.create({
        id: 'test-user-id',
        email: seedEmail.data,
        passwordHash: await hashService.hash('password'),
        firstName: 'Toto',
        lastName: 'EATS',
        roles: ['CLIENT'],
      })
    );
  }

  const seedOwnerEmail = Email.create('resto@mail.fr');
  const seedOwnerPhone = Phone.create('0600000001');
  if (seedOwnerEmail.success && seedOwnerPhone.success) {
    const ownerUser = User.create({
      id: 'demo-owner-1',
      email: seedOwnerEmail.data,
      passwordHash: await hashService.hash('password'),
      firstName: 'Luigi',
      lastName: 'Rossi',
      roles: ['RESTAURATEUR'],
    });
    userRepository.create(ownerUser);
    restaurantOwnerProfileRepository.create(
      RestaurantOwnerProfile.create({ id: crypto.randomUUID(), user: ownerUser, phone: seedOwnerPhone.data })
    );
  }

  const seedCourierEmail = Email.create('livreur@mail.fr');
  if (seedCourierEmail.success) {
    userRepository.create(
      User.create({
        id: 'demo-courier-1',
        email: seedCourierEmail.data,
        passwordHash: await hashService.hash('password'),
        firstName: 'Jean',
        lastName: 'Dupont',
        roles: ['COURIER'],
      })
    );
  }

  const authController = new AuthController(registerClient, registerCourier, registerRestaurantOwner, login);

  const authGuard = new AuthGuard(tokenService);

  return { authController, authGuard };
}