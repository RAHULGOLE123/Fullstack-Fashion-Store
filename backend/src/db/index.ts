import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import "dotenv/config";

const client = postgres(process.env.DATABASE_URL!, { ssl: 'require' }); // Neon में ssl जरूरी होता है

export const db = drizzle(client, { schema });
