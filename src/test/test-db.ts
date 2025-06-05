import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../db/schema';
// import { applySchema } from '../db/db';

// export const createTestDb = (): Database => {
//   const db = new Database(':memory:');
//   db.exec('PRAGMA journal_mode = WAL;');
//   db.exec('PRAGMA foreign_keys = ON;');
//   applySchema(db);
//   return db;
// };
