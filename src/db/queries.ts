import { type UUID, randomUUID } from 'crypto';
import { Database } from 'bun:sqlite';
import { NewTodo, Todo } from '../todos/types';
import { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { todosTable, usersTable } from './schema';
import { eq, desc } from 'drizzle-orm';

export const insertUser = async (
  db: BunSQLiteDatabase,
  email: string,
  password: string
) => {
  const userId = randomUUID();

  const passwordHash = await Bun.password.hash(password);

  const user = db
    .insert(usersTable)
    .values({
      id: userId,
      email,
      passwordHash,
    })
    .returning()
    .get();

  // const insertQuery = db.query(
  //   `
  //   INSERT INTO users (id, email, password_hash)
  //   VALUES (?, ?, ?)
  //   RETURNING id
  //   `
  // );

  // const user = insertQuery.get(userId, email, passwordHash) as { id: UUID };
  return user.id;
};

export const getUserByEmail = (db: BunSQLiteDatabase, email: string) => {
  const user = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();

  // const userQuery = db.query(
  //   'SELECT id, password_hash FROM users WHERE email = ?'
  // );
  // const user = userQuery.get(email) as {
  //   id: string;
  //   password_hash: string;
  // } | null;
  return user;
};

export const getUserById = (db: BunSQLiteDatabase, id: string) => {
  const user = db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();

  // const userQuery = db.query('SELECT id, email FROM users WHERE id = ?');
  // const user = userQuery.get(id) as {
  //   id: string;
  //   email: string;
  // } | null;

  return user;
};

export const insertTodo = (db: BunSQLiteDatabase, todo: NewTodo) => {
  const todoId = randomUUID();

  const result = db
    .insert(todosTable)
    .values({
      id: todoId,
      ...todo,
    })
    .returning()
    .get();

  // const insertQuery = db.query(
  //   `
  //   INSERT INTO todos (id, user_id, title, description, completed)
  //   VALUES (?, ?, ?, ?, ?)
  //   RETURNING *
  //   `
  // );

  // const result = insertQuery.get(
  //   todoId,
  //   todo.userId,
  //   todo.title,
  //   todo.description ?? null,
  //   todo.completed ?? false
  // ) as Todo;

  return result;
};

export const getTodosByUserId = (db: BunSQLiteDatabase, userId: string) => {
  const todos = db
    .select()
    .from(todosTable)
    .where(eq(todosTable.userId, userId))
    .orderBy(desc(todosTable.createdAt))
    .all();

  // const todosQuery = db.query(
  //   'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'
  // );
  // const todos = todosQuery.all(userId) as Todo[];
  return todos;
};
