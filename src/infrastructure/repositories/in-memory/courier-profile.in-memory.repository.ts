import { CourierProfile } from '@domain/entities/user/courier-profile.entity';
import { CourierProfileRepository } from '@application/repositories/courier-profile.repository';

export class CourierProfileInMemoryRepository implements CourierProfileRepository {
  private readonly store = new Map<string, CourierProfile>();

  async findById(id: string): Promise<CourierProfile | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<CourierProfile[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  async findByUserId(userId: string): Promise<CourierProfile | null> {
    return Array.from(this.store.values()).find(
      profile => profile.user.id === userId
    ) ?? null;
  }

  async findAllAvailable(): Promise<CourierProfile[]> {
    return Array.from(this.store.values()).filter(
      profile => profile.status === 'AVAILABLE'
    );
  }

  async create(profile: CourierProfile): Promise<void> {
    this.store.set(profile.id, profile);
  }

  async update(profile: CourierProfile): Promise<void> {
    if (!this.store.has(profile.id)) return;
    this.store.set(profile.id, profile);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}