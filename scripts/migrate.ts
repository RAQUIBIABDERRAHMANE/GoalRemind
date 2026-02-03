import 'dotenv/config';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../lib/db';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || './data/goalremind.db';
const sqlite = new Database(dbPath);

console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations completed successfully!');

sqlite.close();
