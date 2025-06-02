import { sql, relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text().primaryKey(),
  email: text().unique().notNull(),
  passwordHash: text().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  todos: many(todosTable),
}));

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

// this is an application level abstration to help query the todos table
// it doesn't add relations to the database schema
export const todosRelations = relations(todosTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [todosTable.userId],
    references: [usersTable.id],
  }),
}));
