import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../db/schema';
// import { applySchema } from '../db/db';

// export const createTestDb = () => {
//   const sqlite = new Database(':memory:'); // Use in-memory database for testing
//   const db = drizzle({ client: sqlite, casing: 'snake_case', schema });
//   return db;
// };

// export const createTestDb = (): Database => {
//   const db = new Database(':memory:');
//   db.exec('PRAGMA journal_mode = WAL;');
//   db.exec('PRAGMA foreign_keys = ON;');
//   applySchema(db);
//   return db;
// };
