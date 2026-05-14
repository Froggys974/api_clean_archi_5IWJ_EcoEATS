import { UserMapper } from './user.mapper';
import type { UserRow } from '../schema/users.schema';

const validRow: UserRow = {
  id: 'user-1',
  email: 'alice@example.com',
  passwordHash: 'hashed',
  firstName: 'Alice',
  lastName: 'Dupont',
  roles: ['CLIENT'],
  createdAt: new Date('2024-01-01'),
};

describe('UserMapper.toDomain', () => {
  it('maps a valid row to a User domain entity', () => {
    const user = UserMapper.toDomain(validRow);
    expect(user.id).toBe('user-1');
    expect(user.email.getValue()).toBe('alice@example.com');
    expect(user.passwordHash).toBe('hashed');
    expect(user.firstName).toBe('Alice');
    expect(user.lastName).toBe('Dupont');
    expect(user.roles).toEqual(['CLIENT']);
    expect(user.createdAt).toEqual(new Date('2024-01-01'));
  });

  it('throws when email stored in DB is invalid', () => {
    const badRow: UserRow = { ...validRow, email: 'not-an-email' };
    expect(() => UserMapper.toDomain(badRow)).toThrow('not-an-email');
  });
});

describe('UserMapper.toPersistence', () => {
  it('maps a domain User back to an insertable row', () => {
    const user = UserMapper.toDomain(validRow);
    const row = UserMapper.toPersistence(user);
    expect(row.id).toBe('user-1');
    expect(row.email).toBe('alice@example.com');
    expect(row.passwordHash).toBe('hashed');
    expect(row.firstName).toBe('Alice');
    expect(row.lastName).toBe('Dupont');
    expect(row.roles).toEqual(['CLIENT']);
  });
});
