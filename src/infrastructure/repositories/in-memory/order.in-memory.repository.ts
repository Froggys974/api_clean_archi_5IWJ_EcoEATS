import { Order, OrderStatus } from '@domain/entities/order/order.entity';
import { OrderRepository } from '@application/repositories/order.repository';

export class OrderInMemoryRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findByClientId(clientId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.clientId === clientId);
  }

  async findByRestaurantId(restaurantId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.restaurantId === restaurantId);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.status === status);
  }

  async findByRestaurantIdAndStatus(restaurantId: string, status: OrderStatus): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      o => o.restaurantId === restaurantId && o.status === status,
    );
  }

  async findActiveByClientId(clientId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      o => o.clientId === clientId && o.isActive(),
    );
  }

  async findActiveByRestaurantId(restaurantId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      o => o.restaurantId === restaurantId && o.isActive(),
    );
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async create(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async update(order: Order): Promise<void> {
    if (!this.orders.has(order.id)) return;
    this.orders.set(order.id, order);
  }

  async delete(id: string): Promise<void> {
    this.orders.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.orders.has(id);
  }
}
