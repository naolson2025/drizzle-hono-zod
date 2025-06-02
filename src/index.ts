import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { jwt } from 'hono/jwt';
import { auth } from './auth/auth.routes';
import { todos } from './todos/todos.routes';

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not configured.');
  process.exit(1);
}

if (!process.env.DB_FILE_NAME) {
  console.error('DB_FILE_NAME is not configured.');
  process.exit(1);
}

const app = new Hono();

app
  .use('/api/*', csrf())
  .use('*', async (c, next) => {
    if (c.req.path.includes('protected')) {
      return jwt({ secret, cookie: 'authToken' })(c, next);
    }
    await next();
  })
  .route('/api', auth)
  .route('/api/protected', todos);

export default app;
