import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { Delivery } from '@domain/entities/delivery/delivery.entity';
import { OrderRepository } from '@application/repositories/order.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { DeliveryRepository } from '@application/repositories/delivery.repository';
import { DistanceCalculatorPort } from '@application/ports/distance-calculator.port';
import { OrderNotFoundError } from '@domain/errors/order.errors';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';
import { buildPricingConfig } from '@application/config/delivery-pricing.config';

export type MarkOrderReadyOutput = { order: Order };

export class MarkOrderReadyUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly deliveryRepository: DeliveryRepository,
    private readonly distanceCalculator: DistanceCalculatorPort,
  ) {}

  async execute(orderId: string, ownerId: string): Promise<ResultType<MarkOrderReadyOutput, Error>> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return Result.Failed(new OrderNotFoundError(orderId));

    const restaurant = await this.restaurantRepository.findById(order.restaurantId);
    if (!restaurant) return Result.Failed(new RestaurantNotFoundError(order.restaurantId));

    if (!restaurant.belongsToOwner(ownerId)) {
      return Result.Failed(new Error('You do not own this restaurant'));
    }

    const ready = order.markAsReady();
    await this.orderRepository.update(ready);

    const existingDelivery = await this.deliveryRepository.findByOrderId(orderId);
    if (!existingDelivery) {
      const pricingConfig = buildPricingConfig();

      const feeCalc = this.distanceCalculator.calculateDeliveryFeeFromAddresses(
        restaurant.address,
        order.deliveryAddress,
        pricingConfig,
      );

      const delivery = Delivery.create({
        id: crypto.randomUUID(),
        orderId,
        restaurantId: restaurant.id,
        restaurantAddress: restaurant.address,
        deliveryAddress: order.deliveryAddress,
        distance: feeCalc.distance,
        deliveryFee: feeCalc.totalFee,
        pickupFee: pricingConfig.pickupFee,
        pricePerKm: pricingConfig.pricePerKm,
        // Transfer the client's tip integrally to the courier (zero platform commission)
        tipAmount: order.tipAmount,
        status: 'PENDING',
      });

      await this.deliveryRepository.create(delivery);
    }

    return Result.Success({ order: ready });
  }
}
