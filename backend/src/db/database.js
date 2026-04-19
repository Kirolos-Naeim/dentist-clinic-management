import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { env } from '../config/env.js';

sqlite3.verbose();

let dbInstance;

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  const dbFilePath = path.resolve(process.cwd(), env.dbPath);
  fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

  dbInstance = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec('PRAGMA foreign_keys = ON;');
  return dbInstance;
};
