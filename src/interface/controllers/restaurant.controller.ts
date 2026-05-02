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
import { RestaurantPresenter } from '@interface/presenters/restaurant.presenter';
import { ControllerResponse, ErrorResponse } from '@interface/shared/controller-response';
import { AddDishDto, UpdateDishDto, AddOfferDto, UpdateRestaurantDto } from '@interface/dtos/restaurant.dto';

export class RestaurantController {
  constructor(
    private readonly listRestaurants: ListRestaurantsUseCase,
    private readonly getRestaurantById: GetRestaurantByIdUseCase,
    private readonly getMyRestaurant: GetMyRestaurantUseCase,
    private readonly listDishesByRestaurant: ListDishesByRestaurantUseCase,
    private readonly listAllDishes: ListAllDishesUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly listOffers: ListOffersUseCase,
    private readonly listMyOffers: ListMyOffersUseCase,
    private readonly addDish: AddDishUseCase,
    private readonly updateDish: UpdateDishUseCase,
    private readonly deleteDish: DeleteDishUseCase,
    private readonly addOffer: AddOfferUseCase,
    private readonly updateMyRestaurant: UpdateMyRestaurantUseCase,
  ) {}

  async handleListRestaurants(): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listRestaurants.execute();
    if (!result.success) return { statusCode: 500, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.restaurants(result.data.restaurants) };
  }

  async handleGetRestaurantById(id: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.getRestaurantById.execute(id);
    if (!result.success) return { statusCode: 404, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.restaurant(result.data.restaurant) };
  }

  async handleGetMyRestaurant(ownerId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.getMyRestaurant.execute(ownerId);
    if (!result.success) return { statusCode: 404, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.restaurant(result.data.restaurant) };
  }

  async handleListDishesByRestaurant(restaurantId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listDishesByRestaurant.execute(restaurantId);
    if (!result.success) return { statusCode: 404, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.dishes(result.data.dishes) };
  }

  async handleListAllDishes(): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listAllDishes.execute();
    if (!result.success) return { statusCode: 500, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.dishes(result.data.dishes) };
  }

  async handleListCategories(): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listCategories.execute();
    if (!result.success) return { statusCode: 500, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.categories(result.data.categories) };
  }

  async handleListOffers(): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listOffers.execute();
    if (!result.success) return { statusCode: 500, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.offers(result.data.offers) };
  }

  async handleListMyOffers(ownerId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listMyOffers.execute(ownerId);
    if (!result.success) return { statusCode: 404, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.offers(result.data.offers) };
  }

  async handleListMyDishes(ownerId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const restaurantResult = await this.getMyRestaurant.execute(ownerId);
    if (!restaurantResult.success) return { statusCode: 404, data: RestaurantPresenter.error(restaurantResult.error.message) };

    const result = await this.listDishesByRestaurant.execute(restaurantResult.data.restaurant.id);
    if (!result.success) return { statusCode: 500, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.dishes(result.data.dishes) };
  }

  async handleAddDish(ownerId: string, dto: AddDishDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    if (!dto.name || !dto.name.trim() || !dto.description || !dto.description.trim() || dto.priceAmount === undefined || dto.dailyStock === undefined) {
      return { statusCode: 400, data: RestaurantPresenter.error('Missing required fields') };
    }

    const restaurantResult = await this.getMyRestaurant.execute(ownerId);
    if (!restaurantResult.success) return { statusCode: 404, data: RestaurantPresenter.error(restaurantResult.error.message) };

    const addInput: Parameters<typeof this.addDish.execute>[0] = {
      restaurantId: restaurantResult.data.restaurant.id,
      ownerId,
      name: dto.name,
      description: dto.description,
      priceAmount: dto.priceAmount,
      dailyStock: dto.dailyStock,
    };
    if (dto.allergens !== undefined) addInput.allergens = dto.allergens;
    if (dto.imageUrl !== undefined) addInput.imageUrl = dto.imageUrl;
    if (dto.category !== undefined) addInput.category = dto.category;
    const result = await this.addDish.execute(addInput);

    if (!result.success) return { statusCode: 400, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 201, data: RestaurantPresenter.dish(result.data.dish) };
  }

  async handleUpdateDish(dishId: string, ownerId: string, dto: UpdateDishDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.updateDish.execute({ dishId, ownerId, ...dto });
    if (!result.success) return { statusCode: 400, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.dish(result.data.dish) };
  }

  async handleDeleteDish(dishId: string, ownerId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.deleteDish.execute(dishId, ownerId);
    if (!result.success) return { statusCode: 400, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: result.data };
  }

  async handleAddOffer(ownerId: string, dto: AddOfferDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    if (!dto.label || !dto.label.trim() || dto.discountPercent === undefined) {
      return { statusCode: 400, data: RestaurantPresenter.error('Missing required fields') };
    }

    const addInput: Parameters<typeof this.addOffer.execute>[0] = {
      ownerId,
      label: dto.label,
      discountPercent: dto.discountPercent,
    };
    if (dto.imageUrl !== undefined) addInput.imageUrl = dto.imageUrl;

    const result = await this.addOffer.execute(addInput);
    if (!result.success) return { statusCode: 400, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 201, data: RestaurantPresenter.offer(result.data.offer) };
  }

  async handleUpdateMyRestaurant(ownerId: string, dto: UpdateRestaurantDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.updateMyRestaurant.execute({ ownerId, ...dto });
    if (!result.success) return { statusCode: 400, data: RestaurantPresenter.error(result.error.message) };
    return { statusCode: 200, data: RestaurantPresenter.restaurant(result.data.restaurant) };
  }
}
