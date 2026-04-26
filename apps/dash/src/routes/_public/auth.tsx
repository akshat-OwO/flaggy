import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_public/auth"!</div>;
}
