import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/p/$projectSlug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/p/projectSlug"!</div>;
}
