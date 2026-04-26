import { Effect, Either } from "effect";
import { API } from "../lib/api";

export const getSessionAction = async () => {
  const program = Effect.gen(function* () {
    const api = yield* API;
    return yield* api.rpc((c) => c.session.$get());
  }).pipe(Effect.provide(API.Default));

  const result = await Effect.runPromise(Effect.either(program));

  if (Either.isLeft(result)) {
    throw new Error(result.left);
  }

  return result.right;
};
