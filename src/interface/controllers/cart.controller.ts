import { GetOrCreateCartUseCase } from '@application/usecases/cart/get-or-create-cart.use-case';
import { AddItemToCartUseCase } from '@application/usecases/cart/add-item-to-cart.use-case';
import { RemoveItemFromCartUseCase } from '@application/usecases/cart/remove-item-from-cart.use-case';
import { ClearCartUseCase } from '@application/usecases/cart/clear-cart.use-case';
import { UpdateItemQuantityUseCase } from '@application/usecases/cart/update-item-quantity.use-case';
import { CartPresenter } from '@interface/presenters/cart.presenter';
import { ControllerResponse, ErrorResponse } from '@interface/shared/controller-response';
import { AddItemDto } from '@interface/dtos/cart.dto';

export class CartController {
  constructor(
    private readonly getOrCreateCart: GetOrCreateCartUseCase,
    private readonly addItemToCart: AddItemToCartUseCase,
    private readonly removeItemFromCart: RemoveItemFromCartUseCase,
    private readonly clearCart: ClearCartUseCase,
    private readonly updateItemQuantity: UpdateItemQuantityUseCase,
  ) {}

  async handleGetCart(clientId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.getOrCreateCart.execute(clientId);
    if (!result.success) return { statusCode: 500, data: CartPresenter.error(result.error.message) };
    return { statusCode: 200, data: CartPresenter.cart(result.data.cart) };
  }

  async handleAddItem(clientId: string, dto: AddItemDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    if (!dto.dishId || !dto.restaurantId || !dto.quantity || dto.quantity < 1) {
      return { statusCode: 400, data: CartPresenter.error('Missing required fields') };
    }

    const cartResult = await this.getOrCreateCart.execute(clientId);
    if (!cartResult.success) return { statusCode: 500, data: CartPresenter.error(cartResult.error.message) };

    const addInput: Parameters<typeof this.addItemToCart.execute>[0] = {
      cartId: cartResult.data.cart.id,
      dishId: dto.dishId,
      restaurantId: dto.restaurantId,
      quantity: dto.quantity,
    };
    if (dto.specialInstructions !== undefined) addInput.specialInstructions = dto.specialInstructions;
    const result = await this.addItemToCart.execute(addInput);

    if (!result.success) return { statusCode: 400, data: CartPresenter.error(result.error.message) };
    return { statusCode: 200, data: CartPresenter.cart(result.data.cart) };
  }

  async handleRemoveItem(clientId: string, dishId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const cartResult = await this.getOrCreateCart.execute(clientId);
    if (!cartResult.success) return { statusCode: 500, data: CartPresenter.error(cartResult.error.message) };

    const result = await this.removeItemFromCart.execute(cartResult.data.cart.id, dishId);
    if (!result.success) return { statusCode: 400, data: CartPresenter.error(result.error.message) };
    return { statusCode: 200, data: CartPresenter.cart(result.data.cart) };
  }

  async handleClearCart(clientId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const cartResult = await this.getOrCreateCart.execute(clientId);
    if (!cartResult.success) return { statusCode: 500, data: CartPresenter.error(cartResult.error.message) };

    const result = await this.clearCart.execute(cartResult.data.cart.id);
    if (!result.success) return { statusCode: 400, data: CartPresenter.error(result.error.message) };
    return { statusCode: 200, data: CartPresenter.cart(result.data.cart) };
  }

  async handleUpdateItemQuantity(clientId: string, dishId: string, quantity: number): Promise<ControllerResponse<unknown | ErrorResponse>> {
    if (!dishId || !quantity || quantity < 1) {
      return { statusCode: 400, data: CartPresenter.error('Missing required fields') };
    }

    const cartResult = await this.getOrCreateCart.execute(clientId);
    if (!cartResult.success) return { statusCode: 500, data: CartPresenter.error(cartResult.error.message) };

    const result = await this.updateItemQuantity.execute(cartResult.data.cart.id, dishId, quantity);
    if (!result.success) return { statusCode: 400, data: CartPresenter.error(result.error.message) };
    return { statusCode: 200, data: CartPresenter.cart(result.data.cart) };
  }
}
