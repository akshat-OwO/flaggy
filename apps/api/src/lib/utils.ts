import { Context } from "hono";
import { z } from "zod";
import { Effect } from "effect";
import { HTTPException } from "hono/http-exception";

export function errorHandler(err: Error | HTTPException, c: Context) {
  Effect.runFork(Effect.log("===CAUGHT ERROR==="));

  if (err instanceof HTTPException) {
    return c.text(err.message, err.status);
  }

  if (err instanceof z.ZodError) {
    return c.text(err.message, 400);
  }

  Effect.runFork(Effect.log(err));

  return c.text("Something went wrong", 500);
}
