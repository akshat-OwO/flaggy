import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../apps/api/.dev.vars" });

export default defineConfig({
  schema: "./src/schemas/index.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
