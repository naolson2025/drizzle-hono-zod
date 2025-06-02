import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
// import { join } from 'path';

const sqlite = new Database(process.env.DB_FILE_NAME!);
// makes all table names snake_case automatically
export const db = drizzle({ client: sqlite, casing: 'snake_case' });

// const dbPath = join('.', 'db.sqlite');

// export const dbConn = () => {
//   if (!db) {
//     db = new Database(dbPath);
//     db.exec('PRAGMA journal_mode = WAL;');
//     db.exec('PRAGMA foreign_keys = ON;');

//     applySchema(db);
//   }

//   return db;
// };

// export const applySchema = (dbInstance: Database) => {
//   dbInstance.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//       id TEXT PRIMARY KEY,
//       email TEXT UNIQUE NOT NULL,
//       password_hash TEXT NOT NULL
//     );
//   `);

//   // create todos table with foreign key to users
// dbInstance.exec(`
//   CREATE TABLE IF NOT EXISTS todos (
//     id TEXT PRIMARY KEY,
//     user_id TEXT NOT NULL,
//     title TEXT NOT NULL CHECK(LENGTH(TRIM(title)) > 0),
//     description TEXT,
//     completed BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//   );
// `);
// };
