import { User } from '@domain/entities/user/user.entity';
import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { Dish } from '@domain/entities/restaurant/dish.entity';
import { Category } from '@domain/entities/marketing/category.entity';
import { Offer } from '@domain/entities/marketing/offer.entity';
import { RestaurantOwnerProfile } from '@domain/entities/user/restaurant-owner-profile.entity';
import { CourierProfile } from '@domain/entities/user/courier-profile.entity';
import { ClientProfile } from '@domain/entities/user/client-profile.entity';
import { Wallet } from '@domain/entities/delivery/wallet.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Price } from '@domain/value-objects/price.value-object';
import { Address } from '@domain/value-objects/address.value-object';
import { Coordinates } from '@domain/value-objects/coordinates.value-object';
import { Allergen } from '@domain/value-objects/allergen.value-object';
import { UserRepository } from '@application/repositories/user.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { DishRepository } from '@application/repositories/dish.repository';
import { CategoryRepository } from '@application/repositories/category.repository';
import { OfferRepository } from '@application/repositories/offer.repository';
import { WalletRepository } from '@application/repositories/wallet.repository';
import { RestaurantOwnerProfileRepository } from '@application/repositories/restaurant-owner-profile.repository';
import { CourierProfileRepository } from '@application/repositories/courier-profile.repository';
import { ClientProfileRepository } from '@application/repositories/client-profile.repository';
import { HashPort } from '@application/ports/hash.port';

type SeedDeps = {
  userRepository: UserRepository;
  restaurantRepository: RestaurantRepository;
  dishRepository: DishRepository;
  categoryRepository: CategoryRepository;
  offerRepository: OfferRepository;
  walletRepository: WalletRepository;
  restaurantOwnerProfileRepository: RestaurantOwnerProfileRepository;
  courierProfileRepository: CourierProfileRepository;
  clientProfileRepository: ClientProfileRepository;
  hashService: HashPort;
};

function makeAddress(street: string, city: string, lat: number, lon: number): Address {
  const coords = Coordinates.create(lat, lon);
  if (!coords.success) throw new Error('Invalid coords');
  const addr = Address.create({ street, city, postalCode: '75001', country: 'France', coordinates: coords.data });
  if (!addr.success) throw new Error('Invalid address: ' + addr.error.message);
  return addr.data;
}

function makePrice(amount: number): Price {
  const result = Price.create(amount);
  if (!result.success) throw new Error('Invalid price');
  return result.data;
}

function makeAllergen(type: string): Allergen | null {
  const result = Allergen.create(type);
  return result.success ? result.data : null;
}

export async function seedDatabase(deps: SeedDeps): Promise<void> {
  const { userRepository, restaurantRepository, dishRepository, categoryRepository, offerRepository,
    walletRepository, restaurantOwnerProfileRepository, courierProfileRepository, clientProfileRepository, hashService } = deps;

  const passwordHash = await hashService.hash('password');

  // user
  const clientEmail = Email.create('toto@mail.fr');
  if (clientEmail.success) {
    const clientUser = User.create({ id: 'demo-client-1', email: clientEmail.data, passwordHash, firstName: 'Toto', lastName: 'EATS', roles: ['CLIENT'] });
    await userRepository.create(clientUser);
    await clientProfileRepository.create(ClientProfile.create({ id: 'cp-1', user: clientUser, phone: null }));
  }

  const ownerEmail = Email.create('resto@mail.fr');
  const ownerPhone = Phone.create('0600000001');
  if (ownerEmail.success && ownerPhone.success) {
    const ownerUser = User.create({ id: 'demo-owner-1', email: ownerEmail.data, passwordHash, firstName: 'Luigi', lastName: 'Rossi', roles: ['RESTAURATEUR'] });
    await userRepository.create(ownerUser);
    await restaurantOwnerProfileRepository.create(RestaurantOwnerProfile.create({ id: 'rop-1', user: ownerUser, phone: ownerPhone.data }));
  }

  const ownerEmail2 = Email.create('sushi@mail.fr');
  const ownerPhone2 = Phone.create('0600000002');
  if (ownerEmail2.success && ownerPhone2.success) {
    const ownerUser2 = User.create({ id: 'demo-owner-2', email: ownerEmail2.data, passwordHash, firstName: 'Kenji', lastName: 'Tanaka', roles: ['RESTAURATEUR'] });
    await userRepository.create(ownerUser2);
    await restaurantOwnerProfileRepository.create(RestaurantOwnerProfile.create({ id: 'rop-2', user: ownerUser2, phone: ownerPhone2.data }));
  }

  const burgerOwnerEmail = Email.create('burgerowner@mail.fr');
  const burgerOwnerPhone = Phone.create('0600000060');
  if (burgerOwnerEmail.success && burgerOwnerPhone.success) {
    const burgerOwnerUser = User.create({ id: 'demo-burger-owner', email: burgerOwnerEmail.data, passwordHash, firstName: 'Marc', lastName: 'Burger', roles: ['RESTAURATEUR'] });
    await userRepository.create(burgerOwnerUser);
    await restaurantOwnerProfileRepository.create(RestaurantOwnerProfile.create({ id: 'rop-3', user: burgerOwnerUser, phone: burgerOwnerPhone.data }));
  }

  const courierEmail = Email.create('livreur@mail.fr');
  const courierPhone = Phone.create('0600000003');
  if (courierEmail.success && courierPhone.success) {
    const courierUser = User.create({ id: 'demo-courier-1', email: courierEmail.data, passwordHash, firstName: 'Jean', lastName: 'Dupont', roles: ['COURIER'] });
    await userRepository.create(courierUser);
    const courierProfile = CourierProfile.create({ id: 'crp-1', user: courierUser, phone: courierPhone.data, status: 'AVAILABLE' });
    await courierProfileRepository.create(courierProfile);
    await walletRepository.create(Wallet.create({ id: 'wallet-1', courierId: 'demo-courier-1', balance: makePrice(42.30) }));
  }

  // categories
  const categories = [
    { id: 'cat-1', name: 'Pizza', slug: 'pizza', imageUrl: 'https://picsum.photos/100/100?random=201' },
    { id: 'cat-2', name: 'Sushi', slug: 'sushi', imageUrl: 'https://picsum.photos/100/100?random=202' },
    { id: 'cat-3', name: 'Salade', slug: 'salade', imageUrl: 'https://picsum.photos/100/100?random=203' },
    { id: 'cat-4', name: 'Pâtes', slug: 'pates', imageUrl: 'https://picsum.photos/100/100?random=204' },
    { id: 'cat-5', name: 'Burger', slug: 'burger', imageUrl: 'https://picsum.photos/100/100?random=205' },
    { id: 'cat-6', name: 'Desserts', slug: 'desserts', imageUrl: 'https://picsum.photos/100/100?random=206' },
    { id: 'cat-7', name: 'Végétarien', slug: 'vegetarien', imageUrl: 'https://picsum.photos/100/100?random=207' },
    { id: 'cat-8', name: 'Asiatique', slug: 'asiatique', imageUrl: 'https://picsum.photos/100/100?random=208' },
  ];
  for (const c of categories) {
    await categoryRepository.create(Category.create(c));
  }

  // restau
  const luigiPhone = Phone.create('0600000010');
  if (luigiPhone.success) {
    await restaurantRepository.create(Restaurant.create({
      id: 'resto-1', ownerId: 'demo-owner-1', name: "Luigi's Kitchen",
      description: 'Authentique cuisine italienne, pizzas au feu de bois et pâtes fraîches.',
      address: makeAddress('12 rue de la Paix', 'Paris', 48.8706, 2.3311),
      phone: luigiPhone.data, cuisineType: 'Italian',
      openingHours: [0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: '11:00', closeTime: d >= 4 ? '23:00' : '22:00' })),
      status: 'OPEN', imageUrl: 'https://picsum.photos/400/300?random=1', rating: 4.5, highlighted: true,
    }));
  }

  const sushiPhone = Phone.create('0600000020');
  if (sushiPhone.success) {
    await restaurantRepository.create(Restaurant.create({
      id: 'resto-2', ownerId: 'demo-owner-2', name: 'Sushi World',
      description: 'Les meilleurs sushis de Paris, poissons frais livrés chaque matin.',
      address: makeAddress("34 avenue de l'Opéra", 'Paris', 48.8691, 2.3321),
      phone: sushiPhone.data, cuisineType: 'Japanese',
      openingHours: [0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: '12:00', closeTime: '22:30' })),
      status: 'OPEN', imageUrl: 'https://picsum.photos/400/300?random=2', rating: 4.8, highlighted: true,
    }));
  }

  const burgerPhone = Phone.create('0600000030');
  if (burgerPhone.success) {
    await restaurantRepository.create(Restaurant.create({
      id: 'resto-3', ownerId: 'demo-burger-owner', name: 'Burger House',
      description: 'Burgers artisanaux avec des ingrédients locaux.',
      address: makeAddress('5 rue Montmartre', 'Paris', 48.8630, 2.3470),
      phone: burgerPhone.data, cuisineType: 'American',
      openingHours: [0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: '00:00', closeTime: '23:59' })),
      status: 'OPEN', imageUrl: 'https://picsum.photos/400/300?random=3', rating: 4.2, highlighted: true,
    }));
  }

  const tacosPhone = Phone.create('0600000040');
  if (tacosPhone.success) {
    await restaurantRepository.create(Restaurant.create({
      id: 'resto-4', ownerId: 'demo-owner-2', name: 'Tacos Palace',
      description: 'Tacos généreux garnis à la viande grillée, sauce fromagère maison.',
      address: makeAddress('18 boulevard Barbès', 'Paris', 48.8840, 2.3500),
      phone: tacosPhone.data, cuisineType: 'Mexican',
      openingHours: [0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: '11:00', closeTime: '23:30' })),
      status: 'OPEN', imageUrl: 'https://picsum.photos/400/300?random=4', rating: 4.3, highlighted: true,
    }));
  }

  const crepePhone = Phone.create('0600000050');
  if (crepePhone.success) {
    await restaurantRepository.create(Restaurant.create({
      id: 'resto-5', ownerId: 'demo-owner-1', name: 'Crêperie du Midi',
      description: 'Crêpes et galettes bretonnes, préparées à la minute avec des produits locaux.',
      address: makeAddress('7 rue des Écoles', 'Paris', 48.8500, 2.3480),
      phone: crepePhone.data, cuisineType: 'French',
      openingHours: [0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: '10:00', closeTime: '21:00' })),
      status: 'OPEN', imageUrl: 'https://picsum.photos/400/300?random=5', rating: 4.6, highlighted: false,
    }));
  }

  // offres
  await offerRepository.create(Offer.create({ id: 'offer-1', restaurantId: 'resto-1', label: '-10% sur toute la carte', discountPercent: 10, imageUrl: 'https://picsum.photos/400/200?random=301' }));
  await offerRepository.create(Offer.create({ id: 'offer-2', restaurantId: 'resto-2', label: '-15% sur les plateaux', discountPercent: 15, imageUrl: 'https://picsum.photos/400/200?random=302' }));
  await offerRepository.create(Offer.create({ id: 'offer-3', restaurantId: 'resto-3', label: '1 acheté = 1 offert', discountPercent: 50, imageUrl: 'https://picsum.photos/400/200?random=303' }));
  await offerRepository.create(Offer.create({ id: 'offer-4', restaurantId: 'resto-4', label: '-20% le midi', discountPercent: 20, imageUrl: 'https://picsum.photos/400/200?random=304' }));

  // plat chez luigi
  const glutenAllergen = makeAllergen('GLUTEN');
  const milkAllergen = makeAllergen('MILK');
  const fishAllergen = makeAllergen('FISH');
  const sesameAllergen = makeAllergen('SESAME');

  const luigiDishes = [
    { id: 'dish-1', name: 'Pizza Margherita', description: 'Sauce tomate, mozzarella fraîche, basilic.', price: 8.99, allergens: [glutenAllergen, milkAllergen], stock: 12, image: 'https://picsum.photos/200/150?random=101', cat: 'Pizza' },
    { id: 'dish-2', name: 'Pizza Quattro Stagioni', description: 'Champignons, jambon, artichauts, olives.', price: 11.99, allergens: [glutenAllergen, milkAllergen], stock: 10, image: 'https://picsum.photos/200/150?random=102', cat: 'Pizza' },
    { id: 'dish-3', name: 'Caesar Salad', description: 'Romaine, croutons, parmesan, sauce César.', price: 6.99, allergens: [glutenAllergen, milkAllergen], stock: 15, image: 'https://picsum.photos/200/150?random=103', cat: 'Salade' },
    { id: 'dish-4', name: 'Pasta Carbonara', description: 'Spaghettis, lardons, parmesan, oeuf.', price: 11.99, allergens: [glutenAllergen, milkAllergen], stock: 8, image: 'https://picsum.photos/200/150?random=104', cat: 'Pâtes' },
    { id: 'dish-5', name: 'Tiramisu', description: 'Mascarpone, café, biscuits savoiards.', price: 5.99, allergens: [glutenAllergen, milkAllergen], stock: 10, image: 'https://picsum.photos/200/150?random=105', cat: 'Desserts' },
  ];

  for (const d of luigiDishes) {
    await dishRepository.create(Dish.create({
      id: d.id, name: d.name, description: d.description,
      price: makePrice(d.price),
      allergens: d.allergens.filter(Boolean) as Allergen[],
      dailyStock: d.stock, imageUrl: d.image, category: d.cat, restaurantId: 'resto-1',
    }));
  }

  // plat pour sushi
  const sushiDishes = [
    { id: 'dish-6', name: 'Plateau Sushi 12 pièces', description: 'Sélection de maki, nigiri et temaki.', price: 12.99, allergens: [fishAllergen, sesameAllergen, glutenAllergen], stock: 8, image: 'https://picsum.photos/200/150?random=106', cat: 'Sushi' },
    { id: 'dish-7', name: 'Plateau Sushi 24 pièces', description: 'Grand assortiment pour les amateurs.', price: 22.99, allergens: [fishAllergen, sesameAllergen, glutenAllergen], stock: 6, image: 'https://picsum.photos/200/150?random=107', cat: 'Sushi' },
    { id: 'dish-8', name: 'Maki California Roll', description: 'Surimi, avocat, concombre.', price: 7.99, allergens: [fishAllergen, sesameAllergen], stock: 15, image: 'https://picsum.photos/200/150?random=108', cat: 'Sushi' },
    { id: 'dish-9', name: 'Salade Algues', description: 'Wakame, sésame, sauce soja.', price: 4.99, allergens: [sesameAllergen], stock: 20, image: 'https://picsum.photos/200/150?random=109', cat: 'Salade' },
  ];

  for (const d of sushiDishes) {
    await dishRepository.create(Dish.create({
      id: d.id, name: d.name, description: d.description,
      price: makePrice(d.price),
      allergens: d.allergens.filter(Boolean) as Allergen[],
      dailyStock: d.stock, imageUrl: d.image, category: d.cat, restaurantId: 'resto-2',
    }));
  }

  // plat pour burger house
  const burgerDishes = [
    { id: 'dish-10', name: 'Classic Burger', description: 'Boeuf haché, cheddar, salade, tomate, cornichons.', price: 9.99, allergens: [glutenAllergen, milkAllergen], stock: 20, image: 'https://picsum.photos/200/150?random=110', cat: 'Burger' },
    { id: 'dish-11', name: 'Double Cheese Burger', description: 'Double steak, double cheddar, sauce maison.', price: 13.99, allergens: [glutenAllergen, milkAllergen], stock: 15, image: 'https://picsum.photos/200/150?random=111', cat: 'Burger' },
    { id: 'dish-12', name: 'Veggie Burger', description: 'Steak végétalien, légumes grillés, sauce barbecue.', price: 10.99, allergens: [glutenAllergen], stock: 10, image: 'https://picsum.photos/200/150?random=112', cat: 'Végétarien' },
  ];

  for (const d of burgerDishes) {
    await dishRepository.create(Dish.create({
      id: d.id, name: d.name, description: d.description,
      price: makePrice(d.price),
      allergens: d.allergens.filter(Boolean) as Allergen[],
      dailyStock: d.stock, imageUrl: d.image, category: d.cat, restaurantId: 'resto-3',
    }));
  }

  console.log('✓ Database seeded');
}
