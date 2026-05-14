import { DotenvConfigService } from '@infrastructure/config/dotenv-config.service';
import { HashService } from '@infrastructure/services/hash.service';
import { UserRepository } from '@application/repositories/user.repository';
import { UserInMemoryRepository } from '@infrastructure/repositories/in-memory/user.in-memory.repository';
import { UserPostgresRepository } from '@infrastructure/repositories/postgres/user.postgres.repository';
import { createDrizzleClient } from '@infrastructure/repositories/postgres/drizzle.client';
import { RestaurantInMemoryRepository } from '@infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { DishInMemoryRepository } from '@infrastructure/repositories/in-memory/dish.in-memory.repository';
import { CategoryInMemoryRepository } from '@infrastructure/repositories/in-memory/category.in-memory.repository';
import { OfferInMemoryRepository } from '@infrastructure/repositories/in-memory/offer.in-memory.repository';
import { WalletInMemoryRepository } from '@infrastructure/repositories/in-memory/wallet.in-memory.repository';
import { RestaurantOwnerProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/restaurant-owner-profile.in-memory.repository';
import { CourierProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/courier-profile.in-memory.repository';
import { ClientProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/client-profile.in-memory.repository';
import { seedDatabase } from './seed';

async function runSeed() {
  const config = new DotenvConfigService();
  const hashService = new HashService(config);

  const userRepository: UserRepository =
    config.get('DB_ADAPTER') === 'postgres'
      ? new UserPostgresRepository(createDrizzleClient(config.getOrThrow('DATABASE_URL')))
      : new UserInMemoryRepository();

  await seedDatabase({
    userRepository,
    restaurantRepository: new RestaurantInMemoryRepository(),
    dishRepository: new DishInMemoryRepository(),
    categoryRepository: new CategoryInMemoryRepository(),
    offerRepository: new OfferInMemoryRepository(),
    walletRepository: new WalletInMemoryRepository(),
    restaurantOwnerProfileRepository: new RestaurantOwnerProfileInMemoryRepository(),
    courierProfileRepository: new CourierProfileInMemoryRepository(),
    clientProfileRepository: new ClientProfileInMemoryRepository(),
    hashService,
  });

  console.log(`Seed completed (adapter: ${config.get('DB_ADAPTER') ?? 'in-memory'})`);
  process.exit(0);
}

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
