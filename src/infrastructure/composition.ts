// services
import { ConfigPort } from '@application/ports/config.port';
import { seedDatabase } from '@infrastructure/seed/seed';
import { ConsoleLoggerService } from '@infrastructure/services/console-logger.service';
import { HashService } from '@infrastructure/services/hash.service';
import { TokenService } from '@infrastructure/services/token.service';
import { InMemoryPaymentService } from '@infrastructure/services/payment.service';
import { InMemoryNotificationService } from '@infrastructure/services/notification.service';
import { HaversineDistanceCalculatorService } from '@infrastructure/services/distance-calculator.service';

// repo
import { UserRepository } from '@application/repositories/user.repository';
import { UserInMemoryRepository } from '@infrastructure/repositories/in-memory/user.in-memory.repository';
import { UserPostgresRepository } from '@infrastructure/repositories/postgres/user.postgres.repository';
import { createDrizzleClient } from '@infrastructure/repositories/postgres/drizzle.client';
import { ClientProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/client-profile.in-memory.repository';
import { CourierProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/courier-profile.in-memory.repository';
import { RestaurantOwnerProfileInMemoryRepository } from '@infrastructure/repositories/in-memory/restaurant-owner-profile.in-memory.repository';
import { RestaurantInMemoryRepository } from '@infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { DishInMemoryRepository } from '@infrastructure/repositories/in-memory/dish.in-memory.repository';
import { CartInMemoryRepository } from '@infrastructure/repositories/in-memory/cart.in-memory.repository';
import { OrderInMemoryRepository } from '@infrastructure/repositories/in-memory/order.in-memory.repository';
import { DeliveryInMemoryRepository } from '@infrastructure/repositories/in-memory/delivery.in-memory.repository';
import { WalletInMemoryRepository } from '@infrastructure/repositories/in-memory/wallet.in-memory.repository';
import { InvoiceInMemoryRepository } from '@infrastructure/repositories/in-memory/invoice.in-memory.repository';
import { CategoryInMemoryRepository } from '@infrastructure/repositories/in-memory/category.in-memory.repository';
import { OfferInMemoryRepository } from '@infrastructure/repositories/in-memory/offer.in-memory.repository';

// profile use cases
import { GetMyProfileUseCase } from '@application/usecases/profile/get-my-profile.use-case';

// auth use cases
import { RegisterClient } from '@application/usecases/auth/register-client.use-case';
import { RegisterCourier } from '@application/usecases/auth/register-courier.use-case';
import { RegisterRestaurantOwner } from '@application/usecases/auth/register-restaurant-owner.use-case';
import { Login } from '@application/usecases/auth/login.use-case';

// restaurant use cases
import { ListRestaurantsUseCase } from '@application/usecases/restaurant/list-restaurants.use-case';
import { GetRestaurantByIdUseCase } from '@application/usecases/restaurant/get-restaurant-by-id.use-case';
import { GetMyRestaurantUseCase } from '@application/usecases/restaurant/get-my-restaurant.use-case';
import { ListDishesByRestaurantUseCase } from '@application/usecases/restaurant/list-dishes-by-restaurant.use-case';
import { ListAllDishesUseCase } from '@application/usecases/restaurant/list-all-dishes.use-case';
import { ListCategoriesUseCase } from '@application/usecases/restaurant/list-categories.use-case';
import { ListOffersUseCase } from '@application/usecases/restaurant/list-offers.use-case';
import { ListMyOffersUseCase } from '@application/usecases/restaurant/list-my-offers.use-case';
import { AddDishUseCase } from '@application/usecases/restaurant/add-dish.use-case';
import { UpdateDishUseCase } from '@application/usecases/restaurant/update-dish.use-case';
import { DeleteDishUseCase } from '@application/usecases/restaurant/delete-dish.use-case';
import { AddOfferUseCase } from '@application/usecases/restaurant/add-offer.use-case';
import { UpdateMyRestaurantUseCase } from '@application/usecases/restaurant/update-my-restaurant.use-case';

// cart use cases
import { GetOrCreateCartUseCase } from '@application/usecases/cart/get-or-create-cart.use-case';
import { AddItemToCartUseCase } from '@application/usecases/cart/add-item-to-cart.use-case';
import { RemoveItemFromCartUseCase } from '@application/usecases/cart/remove-item-from-cart.use-case';
import { ClearCartUseCase } from '@application/usecases/cart/clear-cart.use-case';
import { UpdateItemQuantityUseCase } from '@application/usecases/cart/update-item-quantity.use-case';

// order use cases
import { CreateOrderUseCase } from '@application/usecases/order/create-order.use-case';
import { AcceptOrderUseCase } from '@application/usecases/order/accept-order.use-case';
import { RefuseOrderUseCase } from '@application/usecases/order/refuse-order.use-case';
import { MarkOrderReadyUseCase } from '@application/usecases/order/mark-order-ready.use-case';
import { ListOrdersByClientUseCase } from '@application/usecases/order/list-orders-by-client.use-case';
import { ListOrdersByRestaurantUseCase } from '@application/usecases/order/list-orders-by-restaurant.use-case';
import { GetOrderByIdUseCase } from '@application/usecases/order/get-order-by-id.use-case';

// delivery use cases
import { AcceptDeliveryUseCase } from '@application/usecases/delivery/accept-delivery.use-case';
import { CompleteDeliveryUseCase } from '@application/usecases/delivery/complete-delivery.use-case';
import { ListAvailableDeliveriesUseCase } from '@application/usecases/delivery/list-available-deliveries.use-case';
import { ListMyDeliveriesUseCase } from '@application/usecases/delivery/list-my-deliveries.use-case';
import { PickupDeliveryUseCase } from '@application/usecases/delivery/pickup-delivery.use-case';
import { SetCourierAvailabilityUseCase } from '@application/usecases/delivery/set-courier-availability.use-case';

// wallet use cases
import { GetMyWalletUseCase } from '@application/usecases/wallet/get-my-wallet.use-case';

// controllers
import { AuthController } from '@interface/controllers/auth.controller';
import { ProfileController } from '@interface/controllers/profile.controller';
import { RestaurantController } from '@interface/controllers/restaurant.controller';
import { CartController } from '@interface/controllers/cart.controller';
import { OrderController } from '@interface/controllers/order.controller';
import { DeliveryController } from '@interface/controllers/delivery.controller';
import { WalletController } from '@interface/controllers/wallet.controller';

// gards
import { AuthGuard } from '@interface/guards/auth.guard';

export type Composition = {
  authController: AuthController;
  profileController: ProfileController;
  restaurantController: RestaurantController;
  cartController: CartController;
  orderController: OrderController;
  deliveryController: DeliveryController;
  walletController: WalletController;
  authGuard: AuthGuard;
};

export async function createComposition(config: ConfigPort): Promise<Composition> {
  const logger = new ConsoleLoggerService();

  // Services
  const hashService = new HashService(config);
  const tokenService = new TokenService(config);
  const paymentService = new InMemoryPaymentService();
  const notificationService = new InMemoryNotificationService();
  const distanceCalculator = new HaversineDistanceCalculatorService();

  // Repositories
  const userRepository: UserRepository =
    config.get('DB_ADAPTER') === 'postgres'
      ? new UserPostgresRepository(createDrizzleClient(config.getOrThrow('DATABASE_URL')))
      : new UserInMemoryRepository();
  const clientProfileRepository = new ClientProfileInMemoryRepository();
  const courierProfileRepository = new CourierProfileInMemoryRepository();
  const restaurantOwnerProfileRepository = new RestaurantOwnerProfileInMemoryRepository();
  const restaurantRepository = new RestaurantInMemoryRepository();
  const dishRepository = new DishInMemoryRepository();
  const cartRepository = new CartInMemoryRepository();
  const orderRepository = new OrderInMemoryRepository();
  const deliveryRepository = new DeliveryInMemoryRepository();
  const walletRepository = new WalletInMemoryRepository();
  const invoiceRepository = new InvoiceInMemoryRepository();
  const categoryRepository = new CategoryInMemoryRepository();
  const offerRepository = new OfferInMemoryRepository();

  await seedDatabase({
    userRepository, restaurantRepository, dishRepository, categoryRepository,
    offerRepository, walletRepository, restaurantOwnerProfileRepository,
    courierProfileRepository, clientProfileRepository, hashService,
  });

  // Profile use cases
  const getMyProfileUC = new GetMyProfileUseCase(userRepository);

  // Auth use cases
  const registerClient = new RegisterClient(userRepository, clientProfileRepository, hashService);
  const registerCourier = new RegisterCourier(userRepository, courierProfileRepository, hashService);
  const registerRestaurantOwner = new RegisterRestaurantOwner(userRepository, restaurantOwnerProfileRepository, hashService);
  const login = new Login(userRepository, hashService, tokenService);

  // Restaurant use cases
  const listRestaurantsUC = new ListRestaurantsUseCase(restaurantRepository);
  const getRestaurantByIdUC = new GetRestaurantByIdUseCase(restaurantRepository);
  const getMyRestaurantUC = new GetMyRestaurantUseCase(restaurantRepository);
  const listDishesByRestaurantUC = new ListDishesByRestaurantUseCase(dishRepository, restaurantRepository);
  const listAllDishesUC = new ListAllDishesUseCase(dishRepository);
  const listCategoriesUC = new ListCategoriesUseCase(categoryRepository);
  const listOffersUC = new ListOffersUseCase(offerRepository);
  const listMyOffersUC = new ListMyOffersUseCase(offerRepository, restaurantRepository);
  const addDishUC = new AddDishUseCase(dishRepository, restaurantRepository);
  const updateDishUC = new UpdateDishUseCase(dishRepository, restaurantRepository);
  const deleteDishUC = new DeleteDishUseCase(dishRepository, restaurantRepository);
  const addOfferUC = new AddOfferUseCase(offerRepository, restaurantRepository);
  const updateMyRestaurantUC = new UpdateMyRestaurantUseCase(restaurantRepository);

  // Cart use cases
  const getOrCreateCartUC = new GetOrCreateCartUseCase(cartRepository);
  const addItemToCartUC = new AddItemToCartUseCase(cartRepository, dishRepository);
  const removeItemFromCartUC = new RemoveItemFromCartUseCase(cartRepository);
  const clearCartUC = new ClearCartUseCase(cartRepository);
  const updateItemQuantityUC = new UpdateItemQuantityUseCase(cartRepository);

  // Order use cases
  const createOrderUC = new CreateOrderUseCase(
    cartRepository, orderRepository, invoiceRepository, restaurantRepository,
    userRepository, distanceCalculator, paymentService, notificationService, logger,
  );
  const acceptOrderUC = new AcceptOrderUseCase(
    orderRepository, restaurantRepository, userRepository, notificationService, logger,
  );
  const refuseOrderUC = new RefuseOrderUseCase(orderRepository, restaurantRepository);
  const markOrderReadyUC = new MarkOrderReadyUseCase(orderRepository, restaurantRepository, deliveryRepository, distanceCalculator);
  const listOrdersByClientUC = new ListOrdersByClientUseCase(orderRepository);
  const listOrdersByRestaurantUC = new ListOrdersByRestaurantUseCase(orderRepository, restaurantRepository);
  const getOrderByIdUC = new GetOrderByIdUseCase(orderRepository);

  // Delivery use cases
  const acceptDeliveryUC = new AcceptDeliveryUseCase(deliveryRepository, courierProfileRepository, restaurantRepository, notificationService, logger);
  const completeDeliveryUC = new CompleteDeliveryUseCase(deliveryRepository, walletRepository, orderRepository, courierProfileRepository, notificationService, logger);
  const listAvailableDeliveriesUC = new ListAvailableDeliveriesUseCase(deliveryRepository);
  const listMyDeliveriesUC = new ListMyDeliveriesUseCase(deliveryRepository);
  const pickupDeliveryUC = new PickupDeliveryUseCase(deliveryRepository);
  const setCourierAvailabilityUC = new SetCourierAvailabilityUseCase(courierProfileRepository);

  // Wallet use cases
  const getMyWalletUC = new GetMyWalletUseCase(walletRepository);

  // Controllers
  const authController = new AuthController(registerClient, registerCourier, registerRestaurantOwner, login);
  const profileController = new ProfileController(getMyProfileUC);
  const restaurantController = new RestaurantController(
    listRestaurantsUC, getRestaurantByIdUC, getMyRestaurantUC, listDishesByRestaurantUC,
    listAllDishesUC, listCategoriesUC, listOffersUC, listMyOffersUC,
    addDishUC, updateDishUC, deleteDishUC, addOfferUC, updateMyRestaurantUC,
  );
  const cartController = new CartController(getOrCreateCartUC, addItemToCartUC, removeItemFromCartUC, clearCartUC, updateItemQuantityUC);
  const orderController = new OrderController(
    createOrderUC, acceptOrderUC, refuseOrderUC, markOrderReadyUC,
    listOrdersByClientUC, listOrdersByRestaurantUC, getOrderByIdUC,
  );
  const deliveryController = new DeliveryController(listAvailableDeliveriesUC, listMyDeliveriesUC, acceptDeliveryUC, completeDeliveryUC, pickupDeliveryUC, setCourierAvailabilityUC);
  const walletController = new WalletController(getMyWalletUC);

  const authGuard = new AuthGuard(tokenService);

  return { authController, profileController, restaurantController, cartController, orderController, deliveryController, walletController, authGuard };
}
