import { createAuthServerInstance } from "@flaggy/auth";
import { database } from "./db";
import { env } from "cloudflare:workers";

export const auth = createAuthServerInstance({
  database: database,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000"],
  googleClientId: env.GOOGLE_CLIENT_ID,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  secret: env.BETTER_AUTH_SECRET,
});
