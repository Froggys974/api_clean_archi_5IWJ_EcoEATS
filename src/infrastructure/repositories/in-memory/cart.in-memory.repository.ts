import { Cart } from '@domain/entities/order/cart.entity';
import { CartRepository } from '@application/repositories/cart.repository';

export class CartInMemoryRepository implements CartRepository {
  private readonly carts = new Map<string, Cart>();

  async findById(id: string): Promise<Cart | null> {
    return this.carts.get(id) ?? null;
  }

  async findByClientId(clientId: string): Promise<Cart | null> {
    return Array.from(this.carts.values()).find(c => c.clientId === clientId) ?? null;
  }

  async findActiveByClientId(clientId: string): Promise<Cart | null> {
    return Array.from(this.carts.values()).find(
      c => c.clientId === clientId && !c.isCheckedOut,
    ) ?? null;
  }

  async findAll(): Promise<Cart[]> {
    return Array.from(this.carts.values());
  }

  async create(cart: Cart): Promise<void> {
    this.carts.set(cart.id, cart);
  }

  async update(cart: Cart): Promise<void> {
    if (!this.carts.has(cart.id)) return;
    this.carts.set(cart.id, cart);
  }

  async delete(id: string): Promise<void> {
    this.carts.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.carts.has(id);
  }

  async deleteByClientId(clientId: string): Promise<void> {
    for (const [id, cart] of this.carts.entries()) {
      if (cart.clientId === clientId) this.carts.delete(id);
    }
  }
}
