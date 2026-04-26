import { Context } from "hono";
import { HonoContext } from "..";

export const sessionHandler = (c: Context<HonoContext>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) {
    return c.json(null);
  }

  return c.json({
    session,
    user,
  });
};
