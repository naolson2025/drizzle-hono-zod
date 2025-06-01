import { type UUID, randomUUID } from 'crypto';
import { Database } from 'bun:sqlite';
import { NewTodo, Todo } from '../todos/types';

export const insertUser = async (
  db: Database,
  email: string,
  password: string
) => {
  const userId = randomUUID();

  const passwordHash = await Bun.password.hash(password);

  const insertQuery = db.query(
    `
    INSERT INTO users (id, email, password_hash)
    VALUES (?, ?, ?)
    RETURNING id
    `
  );

  const user = insertQuery.get(userId, email, passwordHash) as { id: UUID };
  return user.id;
};

export const getUserByEmail = (db: Database, email: string) => {
  const userQuery = db.query(
    'SELECT id, password_hash FROM users WHERE email = ?'
  );
  const user = userQuery.get(email) as {
    id: string;
    password_hash: string;
  } | null;
  return user;
};

export const getUserById = (db: Database, id: string) => {
  const userQuery = db.query('SELECT id, email FROM users WHERE id = ?');
  const user = userQuery.get(id) as {
    id: string;
    email: string;
  } | null;
  return user;
};

export const insertTodo = (db: Database, todo: NewTodo) => {
  const todoId = randomUUID();

  const insertQuery = db.query(
    `
    INSERT INTO todos (id, user_id, title, description, completed)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
    `
  );

  const result = insertQuery.get(
    todoId,
    todo.user_id,
    todo.title,
    todo.description ?? null,
    todo.completed ?? false
  ) as Todo;

  return result;
};

export const getTodosByUserId = (db: Database, userId: string) => {
  const todosQuery = db.query(
    'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'
  );
  const todos = todosQuery.all(userId) as Todo[];
  return todos;
};
