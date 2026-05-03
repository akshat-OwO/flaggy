import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { AlertTriangle, ArrowRight, Loader, Loader2, PlusIcon } from "lucide-react";
import { Badge } from "@flaggy/ui/components/badge";
import { Button } from "@flaggy/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@flaggy/ui/components/card";
import { Form, useAppForm } from "@flaggy/ui/components/form";
import { Popover, PopoverContent, PopoverTrigger } from "@flaggy/ui/components/popover";
import { createProjectMutationOptions, getProjectsOptions } from "../../queries/projects";
import { createProjectSchema } from "../../schemas/projects";
import { useState } from "react";

export const Route = createFileRoute("/_private/projects")({
  component: RouteComponent,
});

function parseTimestamp(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

function RouteComponent() {
  const [openCreatePopover, setOpenCreatePopover] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery(getProjectsOptions());

  const { mutate: createProject, isPending } = useMutation({
    ...createProjectMutationOptions(),
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create project";
      form.setFieldMeta("name", (prev) => ({
        ...prev,
        isTouched: true,
        errorMap: { ...prev.errorMap, onSubmit: message },
      }));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getProjectsOptions().queryKey });
      form.reset();
      setOpenCreatePopover(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: createProjectSchema,
    },
    onSubmit: ({ value }) => {
      createProject(value);
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Open a project to manage flags and environments.
          </p>
        </div>
        <Popover open={openCreatePopover} onOpenChange={setOpenCreatePopover}>
          <PopoverTrigger render={<Button />}>
            <PlusIcon />
            New project
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <form.AppForm>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  void form.handleSubmit();
                }}
                className="flex w-full min-w-[min(100vw-2rem,20rem)] flex-col gap-2"
              >
                <form.AppField name="name">
                  {(field) => <field.TextField label="Project title" />}
                </form.AppField>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <>
                      Create project
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </Form>
            </form.AppForm>
          </PopoverContent>
        </Popover>
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
          No projects yet. Use <span className="font-medium text-foreground">New project</span>{" "}
          above or create one from the sidebar.
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
