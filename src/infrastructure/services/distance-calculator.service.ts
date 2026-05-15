import { Address } from '@domain/value-objects/address.value-object';
import { Coordinates } from '@domain/value-objects/coordinates.value-object';
import { Distance } from '@domain/value-objects/distance.value-object';
import { Price } from '@domain/value-objects/price.value-object';
import {
  DistanceCalculatorPort,
  DeliveryFeeCalculation,
  PricingConfig,
} from '@application/ports/distance-calculator.port';

export class HaversineDistanceCalculatorService implements DistanceCalculatorPort {
  calculateDistance(from: Address, to: Address): Distance {
    const distanceKm = from.distanceTo(to);
    const result = Distance.create(distanceKm);
    if (!result.success) return Distance.zero();
    return result.data;
  }

  calculateDistanceFromCoordinates(from: Coordinates, to: Coordinates): Distance {
    const distanceKm = from.distanceTo(to);
    const result = Distance.create(distanceKm);
    if (!result.success) return Distance.zero();
    return result.data;
  }

  calculateDeliveryFee(crowFliesDistance: Distance, config: PricingConfig): DeliveryFeeCalculation {
    const multiplier = config.roadMultiplier ?? 1.0;
    const roadKm = crowFliesDistance.getKilometers() * multiplier;
    const roadDistanceResult = Distance.create(roadKm);
    const roadDistance = roadDistanceResult.success ? roadDistanceResult.data : crowFliesDistance;

    const distanceFeeResult = config.pricePerKm.multiply(roadKm);
    const distanceFee = distanceFeeResult.success ? distanceFeeResult.data : Price.zero();

    const rawTotalResult = config.pickupFee.add(distanceFee);
    let totalFee = rawTotalResult.success ? rawTotalResult.data : config.pickupFee;

    if (totalFee.lessThan(config.minDeliveryFee)) totalFee = config.minDeliveryFee;
    if (totalFee.greaterThan(config.maxDeliveryFee)) totalFee = config.maxDeliveryFee;

    return {
      distance: roadDistance,
      baseFee: config.pickupFee,
      distanceFee,
      totalFee,
      estimatedDurationMinutes: this.estimateDeliveryDuration(roadDistance),
    };
  }

  calculateDeliveryFeeFromAddresses(from: Address, to: Address, config: PricingConfig): DeliveryFeeCalculation {
    const crowFliesDistance = this.calculateDistance(from, to);
    return this.calculateDeliveryFee(crowFliesDistance, config);
  }

  estimateDeliveryDuration(distance: Distance, averageSpeedKmh: number = 30): number {
    if (averageSpeedKmh <= 0) return 30;
    return Math.ceil((distance.getKilometers() / averageSpeedKmh) * 60) + 5;
  }

  isWithinDeliveryRange(restaurantAddress: Address, deliveryAddress: Address, maxRangeKm: number): boolean {
    return restaurantAddress.distanceTo(deliveryAddress) <= maxRangeKm;
  }

  findNearbyRestaurants(
    centerAddress: Address,
    restaurantAddresses: { id: string; address: Address }[],
    radiusKm: number,
  ): { id: string; distance: Distance }[] {
    return restaurantAddresses
      .map(({ id, address }) => {
        const distKm = centerAddress.distanceTo(address);
        const result = Distance.create(distKm);
        return { id, distance: result.success ? result.data : Distance.zero() };
      })
      .filter(({ distance }) => distance.getKilometers() <= radiusKm);
  }
}
