import { Price } from '@domain/value-objects/price.value-object';
import { PricingConfig } from '@application/ports/distance-calculator.port';

export const DELIVERY_PRICING = {
  PICKUP_FEE: 2.5,
  PRICE_PER_KM: 1.5,
  MIN_DELIVERY_FEE: 3.0,
  MAX_DELIVERY_FEE: 15.0,
} as const;

export function buildPricingConfig(): PricingConfig {
  const pickupFee = Price.create(DELIVERY_PRICING.PICKUP_FEE);
  const pricePerKm = Price.create(DELIVERY_PRICING.PRICE_PER_KM);
  const minDeliveryFee = Price.create(DELIVERY_PRICING.MIN_DELIVERY_FEE);
  const maxDeliveryFee = Price.create(DELIVERY_PRICING.MAX_DELIVERY_FEE);

  if (!pickupFee.success || !pricePerKm.success || !minDeliveryFee.success || !maxDeliveryFee.success) {
    throw new Error('Invalid delivery pricing configuration');
  }

  return {
    pickupFee: pickupFee.data,
    pricePerKm: pricePerKm.data,
    minDeliveryFee: minDeliveryFee.data,
    maxDeliveryFee: maxDeliveryFee.data,
  };
}
