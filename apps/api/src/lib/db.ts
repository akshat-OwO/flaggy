import { createDb } from "@flaggy/db";
import { env } from "cloudflare:workers";

export const database = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN);
