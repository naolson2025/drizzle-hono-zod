import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import app from '.';
import { createTestDb } from './test/test-db';
import { Database } from 'bun:sqlite';
import { loginReq, logoutReq, signupReq } from './test/test-helpers';

let db: Database;

mock.module('../src/db/db.ts', () => {
  return {
    dbConn: () => db,
  };
});

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

describe('signup endpoint', () => {
  it('should signup a user', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({
      message: 'User registered successfully',
      user: { id: expect.any(String), email: 'test@test.com' },
    });

    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
  });

  it('should return 409 if email already exists', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(200);

    const req2 = signupReq();
    const res2 = await app.fetch(req2);
    const json = await res2.json();
    expect(res2.status).toBe(409);
    expect(json).toEqual({
      errors: ['Email already exists'],
    });
  });

  it('should return error if missing email or password', async () => {
    const req = signupReq('', '');
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json).toEqual({
      errors: [
        'Invalid email',
        'Password must be at least 10 characters long.',
      ],
    });
  });
});

describe('login endpoint', () => {
  it('should login a user', async () => {
    // signup a user
    const req = signupReq();
    const res = await app.fetch(req);

    // login
    const req2 = loginReq();
    const res2 = await app.fetch(req2);
    const json = await res2.json();
    expect(res2.status).toBe(200);
    expect(json).toEqual({
      message: 'Login successful',
      user: { id: expect.any(String), email: 'test@test.com' },
    });

    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
  });

  it('should return 400 if email or password is missing', async () => {
    const req = loginReq('', '');
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json).toEqual({
      errors: [
        'Invalid email',
        'Password must be at least 10 characters long.',
      ],
    });
  });

  it('should return 401 if incorrect password provided', async () => {
    // signup a user
    const req = signupReq();
    await app.fetch(req);

    // login
    const req2 = loginReq('test@test.com', 'password456');
    const res = await app.fetch(req2);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json).toEqual({
      errors: ['Invalid credentials'],
    });
  });
});

describe('logout', () => {
  it('should logout a user', async () => {
    const logout = logoutReq();
    const res = await app.fetch(logout);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({
      message: 'Logout successful',
    });

    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=;/);
  });
});
