// drizzle.config.ts
import * as schema from './shared/schema'; // Adjust the path as necessary
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}
// console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL}`); // Log the URL for debugging

const config = {
  schema: './shared/schema.ts', // Use the imported schema
  out: './server/db/migrations',   // output folder for migrations
  dbCredentials: {
    host: 'localhost',
    database: 'mydb',
    user: 'username',
    password: 'password',
    port: 5432, // Ensure this is valid
  },
  dialect: 'postgresql', // Specify the dialect
};

export default config; // Directly export the config object
