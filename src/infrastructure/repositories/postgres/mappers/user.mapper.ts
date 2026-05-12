import { User } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import type { UserRow, InsertUserRow } from '../schema/users.schema';

export class UserMapper {
  static toDomain(row: UserRow): User {
    const emailResult = Email.create(row.email);
    if (!emailResult.success) {
      throw new Error(`Invalid email stored for user ${row.id}: ${row.email}`);
    }
    return User.create({
      id: row.id,
      email: emailResult.data,
      passwordHash: row.passwordHash,
      firstName: row.firstName,
      lastName: row.lastName,
      roles: row.roles,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): InsertUserRow {
    return {
      id: user.id,
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      createdAt: user.createdAt,
    };
  }
}
