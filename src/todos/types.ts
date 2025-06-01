import { type UUID } from 'crypto';

export type NewTodo = {
  user_id: UUID;
  title: string;
  description?: string;
  completed?: boolean;
};

export type Todo = {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};
