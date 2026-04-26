import { hc, type ClientResponse } from "hono/client";
import { Config, Effect } from "effect";
import type { AppType } from "api/types";

const defaultApiBaseUrl = "http://localhost:8787";
const defaultApiBaseUrlObject = new URL(defaultApiBaseUrl);

const fromUnknown = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Typed Hono client for the API, exposed as an Effect Service (Context).
 *
 * @see https://effect.website/docs/guides/context-management/
 *
 * **In another `Effect` service:** list `API` in `dependencies` (e.g. `[API.Default]`), then `const api = yield* API` to access:
 * - `api.client` — raw `hc<AppType>(…)`; use for advanced or untyped call patterns.
 * - `api.rpc(…)` — route calls wrapped in `Effect.Effect<T, string>`: success is JSON `T`, failure is an error string (non-OK body or exception message).
 *
 * **Inside an `Effect.gen` block:** `const data = yield* api.rpc((c) => c.message.$get())` or `yield* api.rpc(client.message.$get())`.
 *
 * **Outside `Effect` (e.g. one-off in React):** `await Effect.runPromise(api.rpc((c) => c.message.$get()))` (or `Effect.runPromiseExit` / `Effect.either` if you need detailed failure handling).
 */
export class API extends Effect.Service<API>()("api/client", {
  effect: Effect.gen(function* () {
    const baseUrl = yield* Config.url("VITE_API_URL").pipe(
      Config.withDefault(defaultApiBaseUrlObject),
      Effect.catchAll(() => Effect.succeed(defaultApiBaseUrlObject)),
      Effect.map((u) => u.href),
    );

    const client = hc<AppType>(baseUrl, {
      init: { credentials: "include" },
    });

    const rpc = <T>(
      call: Promise<ClientResponse<T>> | ((c: typeof client) => Promise<ClientResponse<T>>),
    ): Effect.Effect<T, string> =>
      Effect.gen(function* () {
        const res = yield* Effect.tryPromise({
          try: () => (typeof call === "function" ? call(client) : call),
          catch: fromUnknown,
        });
        if (!res.ok) {
          const err = yield* Effect.tryPromise({
            try: () => res.text(),
            catch: fromUnknown,
          });
          return yield* Effect.fail(err);
        }
        return yield* Effect.tryPromise({
          try: () => res.json() as Promise<T>,
          catch: fromUnknown,
        });
      });

    return {
      client,
      rpc,
    };
  }),
}) {}
