import { drizzle } from "drizzle-orm/libsql/http";
import * as schema from "./schemas";

export * from "drizzle-orm";

export function createDb(dbUrl: string, authToken: string) {
  return drizzle({
    connection: {
      url: dbUrl,
      authToken,
    },
    schema,
  });
}
