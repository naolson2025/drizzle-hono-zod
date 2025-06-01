import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { getUserByEmail, insertUser } from './queries';
import { dbConn } from './db';
import { createTestDb } from '../test/test-db';
import { Database } from 'bun:sqlite';

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
