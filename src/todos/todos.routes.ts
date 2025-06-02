import { Hono } from 'hono';
import { db } from '../db/db';
import { insertTodo, getTodosByUserId } from '../db/queries';
import { createTodoValidator } from './create.todo.schema';

export const todos = new Hono();

todos
  .post('/todos', createTodoValidator, async (c) => {
    const { sub } = c.get('jwtPayload');
    const { title, description, completed } = c.req.valid('json');

    try {
      const todo = insertTodo(db, {
        userId: sub,
        title,
        description,
        completed,
      });

      return c.json(todo, 201);
    } catch (error) {
      console.error('Error creating todo:', error);
      return c.json({ errors: ['Internal server error'] }, 500);
    }
  })
  .get('/todos', async (c) => {
    const { sub } = c.get('jwtPayload');

    try {
      const todos = getTodosByUserId(db, sub);
      return c.json(todos, 200);
    } catch (error) {
      console.error('Error fetching todos:', error);
      return c.json({ errors: ['Internal server error'] }, 500);
    }
  });
