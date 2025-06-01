import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { getUserByEmail, insertTodo, insertUser } from './queries';
import { createTestDb } from '../test/test-db';
import { Database } from 'bun:sqlite';
import { NewTodo } from '../todos/types';
import { randomUUID } from 'crypto';

let db: Database;

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
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

  it('returns null when there is no user by that email', async () => {
    const email = 'test@test.com';
    const user = getUserByEmail(db, email);
    expect(user).toBeNull();
  });
});

describe('insertTodo', () => {
  it('should insert a todo into the database', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);

    const newTodo = {
      user_id: userId,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = insertTodo(db, newTodo);

    expect(todo).toBeDefined();
    expect(todo.id).toBeDefined();
    expect(todo.user_id).toBe(newTodo.user_id);
    expect(todo.title).toBe(newTodo.title);
    expect(todo.description).toBe(newTodo.description!);
    expect(todo.completed).toBeFalsy();
    expect(todo.created_at).toBeDefined();
    expect(todo.updated_at).toBeDefined();
  });

  it('should throw an error if user_id does not exist', () => {
    const newTodo = {
      user_id: randomUUID(), // Non-existent user ID
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
      user_id: userId,
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
