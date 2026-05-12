import { eq } from 'drizzle-orm';
import { UserRepository } from '@application/repositories/user.repository';
import { User } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import type { DrizzleClient } from './drizzle.client';
import { usersTable } from './schema/users.schema';
import { UserMapper } from './mappers/user.mapper';

export class UserPostgresRepository implements UserRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return rows[0] ? UserMapper.toDomain(rows[0]) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.getValue()))
      .limit(1);
    return rows[0] ? UserMapper.toDomain(rows[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(usersTable);
    return rows.map(UserMapper.toDomain);
  }

  async create(user: User): Promise<void> {
    await this.db.insert(usersTable).values(UserMapper.toPersistence(user)).onConflictDoNothing();
  }

  async update(user: User): Promise<void> {
    await this.db.update(usersTable).set(UserMapper.toPersistence(user)).where(eq(usersTable.id, user.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(usersTable).where(eq(usersTable.id, id));
  }
}
