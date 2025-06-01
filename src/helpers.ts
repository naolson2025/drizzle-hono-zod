import { sign } from 'hono/jwt';
import { CookieOptions } from 'hono/utils/cookie';

export const generateToken = async (userId: string) => {
  const secret = process.env.JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    iat: now,
    exp: now + 1 * 60 * 60,
  };
  const token = await sign(payload, secret!);
  return token;
};

export const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax', // or Strict
  path: '/',
  maxAge: 3600, // 1 hour
} as CookieOptions;
