import { createDb } from "@flaggy/db";
import { env } from "cloudflare:workers";
import { Data } from "effect";

export const database = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN);

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: string;
  error?: unknown;
}> {}

export class DatabaseValidationError extends Data.TaggedError("DatabaseValidationError")<{
  message: string;
}> {}

export class AlreadyExistsError extends Error {
  readonly _tag = "AlreadyExistsError" as const;
  constructor(message: string) {
    super(message);
    this.name = "AlreadyExistsError";
  }
}
