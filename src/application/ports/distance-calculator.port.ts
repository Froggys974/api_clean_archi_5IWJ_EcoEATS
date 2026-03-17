import { Address } from '@domain/value-objects/address.value-object';
import { Distance } from '@domain/value-objects/distance.value-object';
import { Price } from '@domain/value-objects/price.value-object';
import { Coordinates } from '@domain/value-objects/coordinates.value-object';

export type DeliveryFeeCalculation = {
  distance: Distance;
  baseFee: Price;
  distanceFee: Price;
  totalFee: Price;
  estimatedDurationMinutes: number;
};

export type PricingConfig = {
  pickupFee: Price;
  pricePerKm: Price;
  minDeliveryFee: Price;
  maxDeliveryFee: Price;
  freeDeliveryThresholdKm?: number;
};

export interface DistanceCalculatorPort {
  /**
   * Calculate the distance between two addresses (as the crow flies)
   * @param from - Starting address
   * @param to - Destination address
   * @returns Distance in kilometers
   */
  calculateDistance(from: Address, to: Address): Distance;

  /**
   * Calculate the distance between two coordinates
   * @param from - Starting coordinates
   * @param to - Destination coordinates
   * @returns Distance in kilometers
   */
  calculateDistanceFromCoordinates(from: Coordinates, to: Coordinates): Distance;

  /**
   * Calculate delivery fee based on distance and pricing configuration
   * @param distance - The distance to calculate fee for
   * @param config - Pricing configuration
   * @returns Delivery fee calculation details
   */
  calculateDeliveryFee(distance: Distance, config: PricingConfig): DeliveryFeeCalculation;

  /**
   * Calculate delivery fee between two addresses
   * @param from - Starting address (restaurant)
   * @param to - Destination address (client)
   * @param config - Pricing configuration
   * @returns Delivery fee calculation details
   */
  calculateDeliveryFeeFromAddresses(
    from: Address,
    to: Address,
    config: PricingConfig
  ): DeliveryFeeCalculation;

  /**
   * Estimate delivery duration based on distance
   * @param distance - The distance
   * @param averageSpeedKmh - Average delivery speed in km/h (default: 30)
   * @returns Estimated duration in minutes
   */
  estimateDeliveryDuration(distance: Distance, averageSpeedKmh?: number): number;

  /**
   * Check if an address is within delivery range
   * @param restaurantAddress - Restaurant address
   * @param deliveryAddress - Delivery address
   * @param maxRangeKm - Maximum delivery range in kilometers
   * @returns True if within range, false otherwise
   */
  isWithinDeliveryRange(
    restaurantAddress: Address,
    deliveryAddress: Address,
    maxRangeKm: number
  ): boolean;

  /**
   * Find restaurants within a certain radius of an address
   * @param centerAddress - Center address (usually client location)
   * @param restaurantAddresses - Array of restaurant addresses with their IDs
   * @param radiusKm - Search radius in kilometers
   * @returns Array of restaurant IDs within radius with their distances
   */
  findNearbyRestaurants(
    centerAddress: Address,
    restaurantAddresses: { id: string; address: Address }[],
    radiusKm: number
  ): { id: string; distance: Distance }[];
}
