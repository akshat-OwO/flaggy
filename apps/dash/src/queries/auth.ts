import { queryOptions } from "@tanstack/react-query";
import { getSessionAction } from "../api/auth";

export const getSessionOptions = () =>
  queryOptions({
    queryKey: ["auth", "session"],
    queryFn: () => getSessionAction(),
  });
