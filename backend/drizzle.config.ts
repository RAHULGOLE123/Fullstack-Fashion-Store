
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export default {
  schema: "./src/db/schema.ts", // Yahan par hum apna database schema define karenge
  out: "./drizzle", // Migrations files yahan store honge
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // .env se DATABASE_URL lenge
  },
} satisfies Config;