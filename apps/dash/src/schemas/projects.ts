import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(4, { error: "Project name should be atleast 4 character long" }),
});
