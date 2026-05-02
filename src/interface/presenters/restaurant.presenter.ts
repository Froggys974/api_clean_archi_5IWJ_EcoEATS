import { Restaurant } from '@domain/entities/restaurant/restaurant.entity';
import { Dish } from '@domain/entities/restaurant/dish.entity';
import { Category } from '@domain/entities/marketing/category.entity';
import { Offer } from '@domain/entities/marketing/offer.entity';

export class RestaurantPresenter {
  static restaurant(r: Restaurant) {
    return {
      id: r.id,
      ownerId: r.ownerId,
      name: r.name,
      description: r.description,
      address: {
        street: r.address.getStreet(),
        city: r.address.getCity(),
        postalCode: r.address.getPostalCode(),
        country: r.address.getCountry(),
        coordinates: {
          latitude: r.address.getCoordinates().getLatitude(),
          longitude: r.address.getCoordinates().getLongitude(),
        },
      },
      phone: r.phone.getValue(),
      cuisineType: r.cuisineType,
      openingHours: r.openingHours,
      status: r.status,
      imageUrl: r.imageUrl ?? null,
      rating: r.rating,
      highlighted: r.highlighted,
      createdAt: r.createdAt,
    };
  }

  static restaurants(list: Restaurant[]) {
    return list.map(RestaurantPresenter.restaurant);
  }

  static dish(d: Dish) {
    return {
      id: d.id,
      restaurantId: d.restaurantId ?? null,
      name: d.name,
      description: d.description,
      price: d.price.getAmount(),
      currency: d.price.getCurrency(),
      allergens: d.allergens.map(a => a.getType()),
      dailyStock: d.dailyStock,
      availableStock: d.availableStock,
      imageUrl: d.imageUrl ?? null,
      category: d.category ?? null,
      isAvailable: d.isAvailable,
    };
  }

  static dishes(list: Dish[]) {
    return list.map(RestaurantPresenter.dish);
  }

  static category(c: Category) {
    return { id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageUrl ?? null };
  }

  static categories(list: Category[]) {
    return list.map(RestaurantPresenter.category);
  }

  static offer(o: Offer) {
    return {
      id: o.id,
      restaurantId: o.restaurantId,
      label: o.label,
      discountPercent: o.discountPercent,
      imageUrl: o.imageUrl ?? null,
    };
  }

  static offers(list: Offer[]) {
    return list.map(RestaurantPresenter.offer);
  }

  static error(message: string) {
    return { message };
  }
}
