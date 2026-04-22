import { hc } from "hono/client";
import { AppType } from ".";
import { env } from "cloudflare:workers";

export const apiClient = hc<AppType>(env.BETTER_AUTH_URL, {
  init: {
    credentials: "include",
  },
});
