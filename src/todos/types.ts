import { type UUID } from 'crypto';

export type NewTodo = {
  userId: UUID;
  title: string;
  description?: string;
  completed?: boolean;
};

export type Todo = {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
