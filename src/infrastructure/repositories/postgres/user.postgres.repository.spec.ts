import { UserPostgresRepository } from './user.postgres.repository';
import { UserMapper } from './mappers/user.mapper';
import { Email } from '@domain/value-objects/email.value-object';
import { User } from '@domain/entities/user/user.entity';

const makeEmail = (value: string): Email => {
  const r = Email.create(value);
  if (!r.success) throw r.error;
  return r.data;
};

const makeUser = (id: string, email: string): User =>
  User.create({
    id,
    email: makeEmail(email),
    passwordHash: 'hash',
    firstName: 'Test',
    lastName: 'User',
    roles: ['CLIENT'],
  });

const mockRow = {
  id: 'user-1',
  email: 'alice@example.com',
  passwordHash: 'hash',
  firstName: 'Test',
  lastName: 'User',
  roles: ['CLIENT'] as const,
  createdAt: new Date('2024-01-01'),
};

describe('UserPostgresRepository', () => {
  let mockDb: jest.Mocked<any>;
  let repo: UserPostgresRepository;

  beforeEach(() => {
    const limitMock = jest.fn().mockResolvedValue([]);
    const whereMock = jest.fn().mockReturnValue({ limit: limitMock });
    const fromMock = jest.fn().mockReturnValue({ where: whereMock });
    const selectMock = jest.fn().mockReturnValue({ from: fromMock });
    const onConflictDoNothingMock = jest.fn().mockResolvedValue(undefined);
    const valuesMock = jest.fn().mockReturnValue({ onConflictDoNothing: onConflictDoNothingMock });
    const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
    const setMock = jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) });
    const updateMock = jest.fn().mockReturnValue({ set: setMock });
    const deleteWhereMock = jest.fn().mockResolvedValue(undefined);
    const deleteMock = jest.fn().mockReturnValue({ where: deleteWhereMock });

    mockDb = { select: selectMock, insert: insertMock, update: updateMock, delete: deleteMock };
    repo = new UserPostgresRepository(mockDb);
  });

  it('findById returns null when no row found', async () => {
    const result = await repo.findById('user-1');
    expect(result).toBeNull();
  });

  it('findById returns a domain User when a row is found', async () => {
    mockDb.select().from().where().limit.mockResolvedValue([mockRow]);
    const result = await repo.findById('user-1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('user-1');
    expect(result?.email.getValue()).toBe('alice@example.com');
  });

  it('findByEmail returns null when no row found', async () => {
    const result = await repo.findByEmail(makeEmail('alice@example.com'));
    expect(result).toBeNull();
  });

  it('create calls insert with the mapped persistence row', async () => {
    const user = makeUser('user-1', 'alice@example.com');
    await repo.create(user);
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.insert().values).toHaveBeenCalledWith(UserMapper.toPersistence(user));
  });
});
