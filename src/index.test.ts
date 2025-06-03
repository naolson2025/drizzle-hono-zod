import { describe, expect, it, beforeEach, mock } from 'bun:test';
import app from '.';
import { loginReq, logoutReq, signupReq } from './test/test-helpers';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

beforeEach(() => {
  mock.module('../src/db/db.ts', () => {
    const db = drizzle({ casing: 'snake_case' });
    migrate(db, { migrationsFolder: './src/db/drizzle' });

    return { db };
  });
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

describe('create todo', () => {
  it('should return 401 if user is not authenticated', async () => {
    const req = new Request('http://localhost/api/protected/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Todo',
        description: 'This is a test todo',
        completed: false,
      }),
    });
    const res = await app.fetch(req);
    const resText = await res.text();
    expect(res.status).toBe(401);
    expect(resText).toBe('Unauthorized');
  });

  it('should create a todo for an authenticated user', async () => {
    // signup a user
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(200);

    // create todo
    const todoReq = new Request('http://localhost/api/protected/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: res.headers.get('set-cookie') || '',
      },
      body: JSON.stringify({
        title: 'Test Todo',
        description: 'This is a test todo',
        completed: false,
      }),
    });
    const todoRes = await app.fetch(todoReq);
    const json = await todoRes.json();
    expect(todoRes.status).toBe(201);
    expect(json).toEqual({
      id: expect.any(String),
      userId: expect.any(String),
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
