// db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import dotenv from 'dotenv';
dotenv.config();
// Initialize the PostgreSQL client with your Supabase database URL
// Ensure you have the DATABASE_URL environment variable set in your .env file
// or in your environment variables
console.log(process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable must be set");
}
const client = postgres(process.env.DATABASE_URL); // Use Supabase's DB URL
export const db = drizzle(client, { schema });
