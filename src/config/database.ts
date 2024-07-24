import { createPool } from "@vercel/postgres";
import "dotenv/config";

export const pool = createPool({
  connectionString: process.env.POSTGRES_URL_NO_SSL,
});
