import { pgTable, pgEnum, text, timestamp } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'CLIENT',
  'RESTAURATEUR',
  'COURIER',
  'ADMIN',
]);

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  roles: userRoleEnum('roles').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type UserRow = typeof usersTable.$inferSelect;
export type InsertUserRow = typeof usersTable.$inferInsert;
