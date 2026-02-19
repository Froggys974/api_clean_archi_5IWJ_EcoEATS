import { User } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { UserRepository } from '@application/repositories/user.repository';

export class UserInMemoryRepository implements UserRepository {
    
  private readonly usersMap = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.usersMap.get(id) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return Array.from(this.usersMap.values()).find(
      user => user.email.equals(email)
    ) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async create(user: User): Promise<void> {
    this.usersMap.set(user.id, user);
  }

  async update(user: User): Promise<void> {
    if (!this.usersMap.has(user.id)) return;
    this.usersMap.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.usersMap.delete(id);
  }
}