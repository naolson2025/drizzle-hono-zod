import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, int } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text().primaryKey(),
  email: text().unique().notNull(),
  passwordHash: text().notNull(),
  age: int(),
});

export const todosTable = sqliteTable('todos', {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  description: text(),
  completed: integer({ mode: 'boolean' }).default(false),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});
