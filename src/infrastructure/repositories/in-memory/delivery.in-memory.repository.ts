import { Delivery, DeliveryStatus } from '@domain/entities/delivery/delivery.entity';
import { DeliveryRepository } from '@application/repositories/delivery.repository';

export class DeliveryInMemoryRepository implements DeliveryRepository {
  private readonly deliveries = new Map<string, Delivery>();

  async findById(id: string): Promise<Delivery | null> {
    return this.deliveries.get(id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    return Array.from(this.deliveries.values()).find(d => d.orderId === orderId) ?? null;
  }

  async findByCourierId(courierId: string): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(d => d.courierId === courierId);
  }

  async findByRestaurantId(restaurantId: string): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(d => d.restaurantId === restaurantId);
  }

  async findByStatus(status: DeliveryStatus): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(d => d.status === status);
  }

  async findActiveByCourierId(courierId: string): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(
      d => d.courierId === courierId && d.isActive(),
    );
  }

  async findPendingDeliveries(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(d => d.status === 'PENDING');
  }

  async findAvailableForCourier(_courierId: string): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(d => d.status === 'PENDING');
  }

  async findByRestaurantIdAndStatus(restaurantId: string, status: DeliveryStatus): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(
      d => d.restaurantId === restaurantId && d.status === status,
    );
  }

  async findAll(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values());
  }

  async create(delivery: Delivery): Promise<void> {
    this.deliveries.set(delivery.id, delivery);
  }

  async update(delivery: Delivery): Promise<void> {
    if (!this.deliveries.has(delivery.id)) return;
    this.deliveries.set(delivery.id, delivery);
  }

  async delete(id: string): Promise<void> {
    this.deliveries.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.deliveries.has(id);
  }

  async countActiveByCourierId(courierId: string): Promise<number> {
    return (await this.findActiveByCourierId(courierId)).length;
  }
}
