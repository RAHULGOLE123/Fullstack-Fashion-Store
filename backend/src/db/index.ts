
import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";
import * as schema from "./schema"; // Apna schema import karein
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); // Ek level up jake .env file load karein

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema }); // Schema ke saath drizzle client export karein