import { Delivery, DeliveryStatus } from '@domain/entities/delivery/delivery.entity';

export interface DeliveryRepository {
  findById(id: string): Promise<Delivery | null>;
  findByOrderId(orderId: string): Promise<Delivery | null>;
  findByCourierId(courierId: string): Promise<Delivery[]>;
  findByRestaurantId(restaurantId: string): Promise<Delivery[]>;
  findByStatus(status: DeliveryStatus): Promise<Delivery[]>;
  findActiveByCourierId(courierId: string): Promise<Delivery[]>;
  findPendingDeliveries(): Promise<Delivery[]>;
  findAvailableForCourier(courierId: string): Promise<Delivery[]>;
  findByRestaurantIdAndStatus(restaurantId: string, status: DeliveryStatus): Promise<Delivery[]>;
  findAll(): Promise<Delivery[]>;
  create(delivery: Delivery): Promise<void>;
  update(delivery: Delivery): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  countActiveByCourierId(courierId: string): Promise<number>;
}
