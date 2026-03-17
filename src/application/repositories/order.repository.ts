import { Order, OrderStatus } from '@domain/entities/order/order.entity';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByClientId(clientId: string): Promise<Order[]>;
  findByRestaurantId(restaurantId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findByRestaurantIdAndStatus(restaurantId: string, status: OrderStatus): Promise<Order[]>;
  findActiveByClientId(clientId: string): Promise<Order[]>;
  findActiveByRestaurantId(restaurantId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  create(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
