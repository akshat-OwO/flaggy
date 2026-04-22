import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";

import authRoutes from "./routes/auth";

export interface HonoContext {
  Bindings: CloudflareBindings;
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session | null;
  };
}

const app = new Hono<HonoContext>()
  .use(
    "*",
    cors({
      origin: "http://localhost:3000",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    c.set("user", session.user);
    c.set("session", session);
    await next();
  })
  .on(["POST", "GET"], "/api/auth*", (c) => {
    return auth.handler(c.req.raw);
  })
  .route("/auth", authRoutes)
  .get("/message", (c) => {
    return c.text("Hello Hono!");
  });

export default app;
export type AppType = typeof app;
