import { ClientProfile } from '@domain/entities/user/client-profile.entity';
import { ClientProfileRepository } from '@application/repositories/client-profile.repository';

export class ClientProfileInMemoryRepository implements ClientProfileRepository {
  private readonly store = new Map<string, ClientProfile>();

  async findById(id: string): Promise<ClientProfile | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<ClientProfile[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  async findByUserId(userId: string): Promise<ClientProfile | null> {
    return Array.from(this.store.values()).find(
      profile => profile.user.id === userId
    ) ?? null;
  }

  async create(profile: ClientProfile): Promise<void> {
    this.store.set(profile.id, profile);
  }

  async update(profile: ClientProfile): Promise<void> {
    if (!this.store.has(profile.id)) return;
    this.store.set(profile.id, profile);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}