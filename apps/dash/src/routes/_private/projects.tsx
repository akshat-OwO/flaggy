import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@flaggy/ui/components/badge";
import { Button } from "@flaggy/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@flaggy/ui/components/card";
import { getProjectsOptions } from "../../queries/projects";

export const Route = createFileRoute("/_private/projects")({
  component: RouteComponent,
});

function parseTimestamp(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

function RouteComponent() {
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery(getProjectsOptions());

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-sm">
          Open a project to manage flags and environments.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading projects…
        </div>
      )}

      {isError && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive text-sm">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Failed to load projects.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? <Loader2 className="size-3.5 animate-spin" /> : "Retry"}
          </Button>
        </div>
      )}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No projects yet. Create one from the sidebar.
        </p>
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const createdAt = parseTimestamp(project.createdAt);
            const updatedAt = parseTimestamp(project.updatedAt);
            return (
              <li key={project.id}>
                <Card
                  className="h-full transition-colors hover:bg-accent/40"
                  render={
                    <Link
                      to="/p/$projectSlug"
                      params={{ projectSlug: project.slug }}
                      className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                  }
                >
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="pr-2">{project.name}</CardTitle>
                      <Badge variant="outline" size="sm" className="font-mono font-normal">
                        {project.slug}
                      </Badge>
                    </div>
                    <CardDescription className="flex flex-col gap-1 text-xs">
                      <span>
                        Created{" "}
                        <time dateTime={createdAt.toISOString()}>{format(createdAt, "PPp")}</time>
                      </span>
                      <span>
                        Updated{" "}
                        <time dateTime={updatedAt.toISOString()}>{format(updatedAt, "PPp")}</time>
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
