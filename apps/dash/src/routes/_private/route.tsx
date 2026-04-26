import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getSessionOptions } from "../../queries/auth";

export const Route = createFileRoute("/_private")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(getSessionOptions());
    return { session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
