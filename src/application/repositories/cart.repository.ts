import { Cart } from '@domain/entities/order/cart.entity';

export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  findByClientId(clientId: string): Promise<Cart | null>;
  findActiveByClientId(clientId: string): Promise<Cart | null>;
  findAll(): Promise<Cart[]>;
  create(cart: Cart): Promise<void>;
  update(cart: Cart): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  deleteByClientId(clientId: string): Promise<void>;
}
