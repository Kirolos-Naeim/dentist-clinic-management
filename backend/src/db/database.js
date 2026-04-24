import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';

let dbInstance;

export const getDb = () => {
  if (dbInstance) return dbInstance;

  const dbFilePath = path.resolve(process.cwd(), env.dbPath);
  fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

  dbInstance = new Database(dbFilePath);
  dbInstance.pragma('foreign_keys = ON');
  return dbInstance;
};
