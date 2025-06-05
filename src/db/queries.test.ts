import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import {
  getTodosByUserId,
  getUserByEmail,
  insertTodo,
  insertUser,
} from './queries';
import { NewTodo } from '../todos/types';
import { randomUUID } from 'crypto';
import { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

let db: BunSQLiteDatabase;

beforeEach(async () => {
  db = drizzle({ casing: 'snake_case' });
  migrate(db, { migrationsFolder: './src/db/drizzle' });
});

describe('insertUser', () => {
  it('should insert a user into the database', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);
    expect(userId).toBeDefined();
  });

  it('should throw an error if the email is already in the db', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    await insertUser(db, email, password);

    try {
      await insertUser(db, email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-ignore
      expect(error.message).toMatch(/UNIQUE constraint failed/);
    }
  });

  it('should throw an error if the password is empty', async () => {
    const email = 'test@test.com';
    const password = '';
    try {
      await insertUser(db, email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-ignore
      expect(error.message).toMatch(/password must not be empty/);
    }
  });
});

describe('getUserByEmail', () => {
  it('return a user by a given email', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    await insertUser(db, email, password);

    const user = getUserByEmail(db, email);
    expect(user).toBeDefined();
  });

  it('returns undefined when there is no user by that email', async () => {
    const email = 'test@test.com';
    const user = getUserByEmail(db, email);
    expect(user).toBeUndefined();
  });
});

describe('insertTodo', () => {
  it('should insert a todo into the database', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);

    const newTodo = {
      userId: userId,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = insertTodo(db, newTodo);

    expect(todo).toBeDefined();
    expect(todo.id).toBeDefined();
    expect(todo.userId).toBe(newTodo.userId);
    expect(todo.title).toBe(newTodo.title);
    expect(todo.description).toBe(newTodo.description!);
    expect(todo.completed).toBeFalsy();
    expect(todo.createdAt).toBeDefined();
    expect(todo.updatedAt).toBeDefined();
  });

  it('should throw an error if user_id does not exist', () => {
    const newTodo = {
      userId: randomUUID(), // Non-existent user ID
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;

    try {
      insertTodo(db, newTodo);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-ignore
      expect(error.message).toMatch(/FOREIGN KEY constraint failed/);
    }
  });

  it('should throw an error if title is empty', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);
    const newTodo = {
      userId: userId,
      title: '', // Empty title
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    try {
      insertTodo(db, newTodo);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-ignore
      expect(error.message).toMatch(/CHECK constraint failed/);
    }
  });
});

describe('getTodosByUserId', () => {
  it('should return todos for a given user ID', async () => {
    const userId = await insertUser(db, 'test@test.com', 'password123');

    const newTodo1 = {
      userId: userId,
      title: 'Test Todo 1',
      description: 'This is the first test todo',
      completed: false,
    } as NewTodo;
    const newTodo2 = {
      userId: userId,
      title: 'Test Todo 2',
      description: 'This is the second test todo',
      completed: true,
    } as NewTodo;
    insertTodo(db, newTodo1);
    insertTodo(db, newTodo2);
    const todos = getTodosByUserId(db, userId);
    expect(todos).toBeDefined();
    expect(todos.length).toBe(2);
    expect(todos[0].userId).toBe(userId);
    expect(todos[1].userId).toBe(userId);
    expect(todos[0].title).toBe(newTodo1.title);
    expect(todos[1].title).toBe(newTodo2.title);
    expect(todos[0].description).toBe(newTodo1.description!);
    expect(todos[1].description).toBe(newTodo2.description!);
    expect(todos[0].completed).toBeFalsy();
    expect(todos[1].completed).toBeTruthy();
  });

  it('should return an empty array if no todos exist for the user', async () => {
    const userId = await insertUser(db, 'test@test.com', 'password123');
    const todos = getTodosByUserId(db, userId);
    expect(todos).toBeDefined();
    expect(todos.length).toBe(0);
  });

  it('should return an empty array if user_id does not exist', () => {
    const todos = getTodosByUserId(db, randomUUID()); // Non-existent user ID
    expect(todos).toBeDefined();
    expect(todos.length).toBe(0);
  });
});
