import { Result, ResultType } from '@domain/shared/result';
import { Order } from '@domain/entities/order/order.entity';
import { Delivery } from '@domain/entities/delivery/delivery.entity';
import { Price } from '@domain/value-objects/price.value-object';
import { OrderRepository } from '@application/repositories/order.repository';
import { RestaurantRepository } from '@application/repositories/restaurant.repository';
import { DeliveryRepository } from '@application/repositories/delivery.repository';
import { DistanceCalculatorPort } from '@application/ports/distance-calculator.port';
import { OrderNotFoundError } from '@domain/errors/order.errors';
import { RestaurantNotFoundError } from '@domain/errors/restaurant.errors';

const PICKUP_FEE = 2.5;
const PRICE_PER_KM = 1.5;
const MIN_DELIVERY_FEE = 3.0;
const MAX_DELIVERY_FEE = 15.0;

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
      const pickupFeeResult = Price.create(PICKUP_FEE);
      const pricePerKmResult = Price.create(PRICE_PER_KM);
      const minFeeResult = Price.create(MIN_DELIVERY_FEE);
      const maxFeeResult = Price.create(MAX_DELIVERY_FEE);

      if (!pickupFeeResult.success || !pricePerKmResult.success || !minFeeResult.success || !maxFeeResult.success) {
        return Result.Failed(new Error('Failed to create delivery pricing configuration'));
      }

      const feeCalc = this.distanceCalculator.calculateDeliveryFeeFromAddresses(
        restaurant.address,
        order.deliveryAddress,
        {
          pickupFee: pickupFeeResult.data,
          pricePerKm: pricePerKmResult.data,
          minDeliveryFee: minFeeResult.data,
          maxDeliveryFee: maxFeeResult.data,
        },
      );

      const delivery = Delivery.create({
        id: crypto.randomUUID(),
        orderId,
        restaurantId: restaurant.id,
        restaurantAddress: restaurant.address,
        deliveryAddress: order.deliveryAddress,
        distance: feeCalc.distance,
        deliveryFee: feeCalc.totalFee,
        pickupFee: pickupFeeResult.data,
        pricePerKm: pricePerKmResult.data,
        status: 'PENDING',
      });

      await this.deliveryRepository.create(delivery);
    }

    return Result.Success({ order: ready });
  }
}
