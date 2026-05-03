import { Effect, Either } from "effect";
import { API } from "../lib/api";
import z from "zod";
import { createProjectSchema } from "../schemas/projects";

export const getProjectsAction = async () => {
  const program = Effect.gen(function* () {
    const api = yield* API;
    return yield* api.rpc((c) => c.projects.fetch.$get());
  }).pipe(Effect.provide(API.Default));

  const result = await Effect.runPromise(Effect.either(program));

  if (Either.isLeft(result)) {
    throw new Error(result.left);
  }

  return result.right;
};

export const createProjectAction = async (payload: z.infer<typeof createProjectSchema>) => {
  const program = Effect.gen(function* () {
    const api = yield* API;
    return yield* api.rpc((c) => c.projects.create.$post({ form: payload }));
  }).pipe(Effect.provide(API.Default));

  const result = await Effect.runPromise(Effect.either(program));

  if (Either.isLeft(result)) {
    throw new Error(result.left);
  }

  return result.right;
};
