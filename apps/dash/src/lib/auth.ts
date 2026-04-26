import { Effect, Config } from "effect";
import { createAuthClient } from "better-auth/react";

const defaultApiBaseUrl = "http://localhost:8787";
const defaultApiBaseUrlObject = new URL(defaultApiBaseUrl);

export class Auth extends Effect.Service<Auth>()("auth/client", {
  effect: Effect.gen(function* () {
    const baseURL = yield* Config.url("VITE_API_URL").pipe(
      Config.withDefault(defaultApiBaseUrlObject),
      Effect.catchAll(() => Effect.succeed(defaultApiBaseUrlObject)),
      Effect.map((u) => u.href),
    );

    return createAuthClient({ baseURL });
  }),
}) {}
