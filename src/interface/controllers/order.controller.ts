import { CreateOrderUseCase } from '@application/usecases/order/create-order.use-case';
import { AcceptOrderUseCase } from '@application/usecases/order/accept-order.use-case';
import { RefuseOrderUseCase } from '@application/usecases/order/refuse-order.use-case';
import { MarkOrderReadyUseCase } from '@application/usecases/order/mark-order-ready.use-case';
import { ListOrdersByClientUseCase } from '@application/usecases/order/list-orders-by-client.use-case';
import { ListOrdersByRestaurantUseCase } from '@application/usecases/order/list-orders-by-restaurant.use-case';
import { GetOrderByIdUseCase } from '@application/usecases/order/get-order-by-id.use-case';
import { OrderPresenter } from '@interface/presenters/order.presenter';
import { ControllerResponse, ErrorResponse } from '@interface/shared/controller-response';
import { CheckoutDto, AcceptOrderDto, RefuseOrderDto } from '@interface/dtos/order.dto';
import { Address } from '@domain/value-objects/address.value-object';
import { Coordinates } from '@domain/value-objects/coordinates.value-object';

const DEFAULT_DELIVERY_COORDINATES = { lat: 48.8566, lon: 2.3522 } as const;
const DEFAULT_PAYMENT_METHOD = 'CREDIT_CARD' as const;
const DEFAULT_SERVICE_FEE_RATE = 0.1;

export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
    private readonly refuseOrderUseCase: RefuseOrderUseCase,
    private readonly markOrderReadyUseCase: MarkOrderReadyUseCase,
    private readonly listOrdersByClient: ListOrdersByClientUseCase,
    private readonly listOrdersByRestaurant: ListOrdersByRestaurantUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
  ) {}

  async handleCheckout(clientId: string, dto: CheckoutDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    if (!dto.cartId || !dto.deliveryStreet || !dto.deliveryCity || !dto.deliveryPostalCode || !dto.deliveryCountry) {
      return { statusCode: 400, data: OrderPresenter.error('Missing required fields') };
    }

    const coordsResult = Coordinates.create(DEFAULT_DELIVERY_COORDINATES.lat, DEFAULT_DELIVERY_COORDINATES.lon);
    if (!coordsResult.success) return { statusCode: 500, data: OrderPresenter.error('Coordinates error') };

    const addressResult = Address.create({
      street: dto.deliveryStreet,
      city: dto.deliveryCity,
      postalCode: dto.deliveryPostalCode,
      country: dto.deliveryCountry,
      coordinates: coordsResult.data,
    });
    if (!addressResult.success) return { statusCode: 400, data: OrderPresenter.error(addressResult.error.message) };

    const result = await this.createOrderUseCase.execute({
      cartId: dto.cartId,
      clientId,
      deliveryAddress: addressResult.data,
      paymentMethod: DEFAULT_PAYMENT_METHOD,
      serviceFeeRate: DEFAULT_SERVICE_FEE_RATE,
    });

    if (!result.success) return { statusCode: 400, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 201, data: OrderPresenter.order(result.data.order) };
  }

  async handleListMyOrders(clientId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listOrdersByClient.execute(clientId);
    if (!result.success) return { statusCode: 500, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 200, data: OrderPresenter.orders(result.data.orders) };
  }

  async handleGetOrderById(orderId: string, clientId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.getOrderByIdUseCase.execute(orderId, clientId);
    if (!result.success) return { statusCode: 404, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 200, data: OrderPresenter.order(result.data.order) };
  }

  async handleListRestaurantOrders(ownerId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.listOrdersByRestaurant.execute(ownerId);
    if (!result.success) return { statusCode: 404, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 200, data: OrderPresenter.orders(result.data.orders) };
  }

  async handleAcceptOrder(orderId: string, ownerId: string, dto: AcceptOrderDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.acceptOrderUseCase.execute({
      orderId,
      ownerId,
      preparationTimeMinutes: dto.preparationTimeMinutes,
    });
    if (!result.success) return { statusCode: 400, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 200, data: OrderPresenter.order(result.data.order) };
  }

  async handleRefuseOrder(orderId: string, ownerId: string, dto: RefuseOrderDto): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const refuseInput: Parameters<typeof this.refuseOrderUseCase.execute>[0] = { orderId, ownerId };
    if (dto.reason !== undefined) refuseInput.reason = dto.reason;
    const result = await this.refuseOrderUseCase.execute(refuseInput);
    if (!result.success) return { statusCode: 400, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 200, data: OrderPresenter.order(result.data.order) };
  }

  async handleMarkOrderReady(orderId: string, ownerId: string): Promise<ControllerResponse<unknown | ErrorResponse>> {
    const result = await this.markOrderReadyUseCase.execute(orderId, ownerId);
    if (!result.success) return { statusCode: 400, data: OrderPresenter.error(result.error.message) };
    return { statusCode: 200, data: OrderPresenter.order(result.data.order) };
  }
}
