import { CourierProfile } from './courier-profile.entity';
import { User } from './user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';

function makeUser(id = 'u-1'): User {
  const email = Email.create('test@test.com');
  if (!email.success) throw new Error('email');
  return User.create({ id, email: email.data, passwordHash: 'hash', firstName: 'Jean', lastName: 'Test', roles: ['COURIER'] });
}

function makePhone(): Phone {
  const r = Phone.create('0600000000');
  if (!r.success) throw new Error('phone');
  return r.data;
}

function makeStandardCourier(activeCount = 0): CourierProfile {
  return CourierProfile.create({
    id: 'cp-1',
    user: makeUser(),
    phone: makePhone(),
    status: 'AVAILABLE',
    level: 'STANDARD',
    activeDeliveriesCount: activeCount,
  });
}

function makeExpertCourier(activeCount = 0): CourierProfile {
  return CourierProfile.create({
    id: 'cp-2',
    user: makeUser('u-2'),
    phone: makePhone(),
    status: 'AVAILABLE',
    level: 'EXPERT',
    activeDeliveriesCount: activeCount,
  });
}

describe('CourierProfile - delivery limits', () => {
  describe('STANDARD courier', () => {
    it('can accept when no active delivery', () => {
      expect(makeStandardCourier(0).canAcceptDelivery()).toBe(true);
    });

    it('cannot accept when already has 1 active delivery', () => {
      expect(makeStandardCourier(1).canAcceptDelivery()).toBe(false);
    });

    it('max deliveries is 1', () => {
      expect(makeStandardCourier().getMaxDeliveries()).toBe(1);
    });
  });

  describe('EXPERT courier', () => {
    it('can accept when no active delivery', () => {
      expect(makeExpertCourier(0).canAcceptDelivery()).toBe(true);
    });

    it('can accept when has 1 active delivery', () => {
      expect(makeExpertCourier(1).canAcceptDelivery()).toBe(true);
    });

    it('cannot accept when already has 2 active deliveries', () => {
      expect(makeExpertCourier(2).canAcceptDelivery()).toBe(false);
    });

    it('max deliveries is 2', () => {
      expect(makeExpertCourier().getMaxDeliveries()).toBe(2);
    });
  });

  describe('availability check', () => {
    it('UNAVAILABLE courier cannot accept any delivery', () => {
      const courier = CourierProfile.create({
        id: 'cp-3',
        user: makeUser('u-3'),
        phone: makePhone(),
        status: 'UNAVAILABLE',
        level: 'EXPERT',
        activeDeliveriesCount: 0,
      });
      expect(courier.canAcceptDelivery()).toBe(false);
    });
  });

  describe('level promotion/demotion', () => {
    it('promotes to EXPERT', () => {
      const promoted = makeStandardCourier().promoteToExpert();
      expect(promoted.isExpert()).toBe(true);
      expect(promoted.getMaxDeliveries()).toBe(2);
    });

    it('demotes to STANDARD', () => {
      const demoted = makeExpertCourier().demoteToStandard();
      expect(demoted.isStandard()).toBe(true);
      expect(demoted.getMaxDeliveries()).toBe(1);
    });
  });

  describe('active delivery counter', () => {
    it('increments correctly', () => {
      const c = makeStandardCourier(0).incrementActiveDeliveries();
      expect(c.activeDeliveriesCount).toBe(1);
    });

    it('decrements correctly', () => {
      const c = makeStandardCourier(1).decrementActiveDeliveries();
      expect(c.activeDeliveriesCount).toBe(0);
    });

    it('never goes below zero', () => {
      const c = makeStandardCourier(0).decrementActiveDeliveries();
      expect(c.activeDeliveriesCount).toBe(0);
    });
  });
});
