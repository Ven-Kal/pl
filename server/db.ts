// db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { log } from 'console';

dotenv.config();

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set");
}

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
console.log(`Connecting to Supabase at: ${supabaseUrl}`);

// Create a custom connection string for postgres.js from the Supabase credentials
// The format is: postgres://postgres:[ANON_KEY]@[PROJECT_REF].supabase.co:5432/postgres
// Extract project reference from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  throw new Error("Could not extract project reference from SUPABASE_URL");
}

const connectionString = `postgres://postgres:${supabaseAnonKey}@db.${projectRef}.supabase.co:5432/postgres`;

// Initialize postgres client with the connection string
const client = postgres(connectionString, {
  ssl: 'require', // Supabase requires SSL
  max: 10, // Connection pool size
});

// Initialize drizzle with the postgres client and schema
export const db = drizzle(client, { schema });

// Export Supabase client for direct Supabase operations if needed
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
