import { Hono } from "hono";
import { HonoContext } from "..";

const app = new Hono<HonoContext>().get("/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

export default app;
