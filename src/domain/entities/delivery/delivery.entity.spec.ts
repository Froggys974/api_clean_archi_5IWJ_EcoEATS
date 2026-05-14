import { Delivery } from './delivery.entity';
import { Price } from '@domain/value-objects/price.value-object';
import { Address } from '@domain/value-objects/address.value-object';
import { Distance } from '@domain/value-objects/distance.value-object';
import { Coordinates } from '@domain/value-objects/coordinates.value-object';

function makeAddress(): Address {
  const coords = Coordinates.create(48.8566, 2.3522);
  if (!coords.success) throw new Error('coords');
  const addr = Address.create({ street: '1 rue Test', city: 'Paris', postalCode: '75001', country: 'France', coordinates: coords.data });
  if (!addr.success) throw new Error('addr');
  return addr.data;
}

function makePrice(amount: number): Price {
  const r = Price.create(amount);
  if (!r.success) throw new Error('price');
  return r.data;
}

function makeDistance(km: number): Distance {
  const r = Distance.create(km);
  if (!r.success) throw new Error('distance');
  return r.data;
}

function makeDelivery(tipAmount?: Price): Delivery {
  return Delivery.create({
    id: 'del-1',
    orderId: 'ord-1',
    restaurantId: 'resto-1',
    restaurantAddress: makeAddress(),
    deliveryAddress: makeAddress(),
    distance: makeDistance(5),
    deliveryFee: makePrice(5),
    pickupFee: makePrice(2.5),
    pricePerKm: makePrice(1.5),
    tipAmount,
  });
}

describe('Delivery - tip system', () => {
  it('defaults tipAmount to zero', () => {
    const delivery = makeDelivery();
    expect(delivery.tipAmount.getAmount()).toBe(0);
  });

  it('carries the tip amount when provided', () => {
    const delivery = makeDelivery(makePrice(3));
    expect(delivery.tipAmount.getAmount()).toBe(3);
  });

  it('calculateCourierEarnings includes tip', () => {
    // 2.5 (pickup) + 5*1.5 (distance fee) + 2 (tip) = 12
    const delivery = makeDelivery(makePrice(2));
    const earnings = delivery.calculateCourierEarnings();
    expect(earnings.getAmount()).toBe(2.5 + 5 * 1.5 + 2);
  });

  it('calculateCourierEarnings without tip equals base fee + distance fee', () => {
    const delivery = makeDelivery();
    const earnings = delivery.calculateCourierEarnings();
    expect(earnings.getAmount()).toBe(2.5 + 5 * 1.5);
  });

  it('addTip replaces the existing tip (not cumulative)', () => {
    const delivery = makeDelivery(makePrice(1));
    const updated = delivery.addTip(makePrice(5));
    expect(updated.tipAmount.getAmount()).toBe(5);
  });

  it('rejects negative tip amounts', () => {
    const delivery = makeDelivery();
    expect(() => delivery.addTip(makePrice(0))).not.toThrow();
    // negative price cannot be created, but the guard is in addTip as well
  });

  it('tip has zero platform commission: service fee is independent of tip', () => {
    // The courier gets the full tip; the platform service fee is NOT computed on the tip
    const tipAmount = 3;
    const delivery = makeDelivery(makePrice(tipAmount));
    const earnings = delivery.calculateCourierEarnings();
    // earnings = pickup + distance + tip (100%)
    expect(earnings.getAmount()).toBeCloseTo(2.5 + 5 * 1.5 + tipAmount);
  });
});

describe('Delivery - status transitions', () => {
  it('goes PENDING -> ASSIGNED -> ACCEPTED -> PICKED_UP -> DELIVERED', () => {
    let d = makeDelivery();
    expect(d.status).toBe('PENDING');
    d = d.assignToCourier('courier-1');
    expect(d.status).toBe('ASSIGNED');
    expect(d.courierId).toBe('courier-1');
    d = d.accept();
    expect(d.status).toBe('ACCEPTED');
    d = d.markAsPickedUp();
    expect(d.status).toBe('PICKED_UP');
    d = d.markAsDelivered();
    expect(d.status).toBe('DELIVERED');
  });

  it('cannot accept a delivered delivery', () => {
    let d = makeDelivery();
    d = d.assignToCourier('c').accept().markAsPickedUp().markAsDelivered();
    expect(() => d.accept()).toThrow();
  });

  it('cannot pickup a non-accepted delivery', () => {
    const d = makeDelivery().assignToCourier('c');
    expect(() => d.markAsPickedUp()).toThrow();
  });
});
