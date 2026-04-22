import { betterAuth } from "better-auth";
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle";

export function createAuthServerInstance({
  database,
  secret,
  baseURL,
  trustedOrigins,
  googleClientId,
  googleClientSecret,
}: {
  database: DB;
  secret: string;
  baseURL: string;
  /** Origins allowed for CSRF / cross-origin auth (e.g. SPA on http://localhost:3000). */
  trustedOrigins?: string[];
  googleClientId: string;
  googleClientSecret: string;
}) {
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins,
    database: drizzleAdapter(database, {
      provider: "sqlite",
    }),
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
    },
  });
}
