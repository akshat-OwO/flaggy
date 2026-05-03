import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createProjectAction, getProjectsAction } from "../api/projects";
import z from "zod";
import { createProjectSchema } from "../schemas/projects";

export const getProjectsOptions = () =>
  queryOptions({
    queryKey: ["projects", "fetch"],
    queryFn: () => getProjectsAction(),
  });

export const createProjectMutationOptions = () =>
  mutationOptions({
    mutationKey: ["projects", "create"],
    mutationFn: (payload: z.infer<typeof createProjectSchema>) => createProjectAction(payload),
  });
