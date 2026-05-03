import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProjectMutationOptions, getProjectsOptions } from "../../queries/projects";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@flaggy/ui/components/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@flaggy/ui/components/popover";
import { Form, useAppForm } from "@flaggy/ui/components/form";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightIcon,
  Loader,
  PlusIcon,
  RefreshCcw,
} from "lucide-react";
import { createProjectSchema } from "../../schemas/projects";
import { Button } from "@flaggy/ui/components/button";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";

export function ProjectSidebarButtons() {
  const [openCreatePopover, setOpenCreatePopover] = useState(false);
  const { data: projects, refetch, isLoading, isError } = useQuery(getProjectsOptions());

  const queryClient = useQueryClient();
  const { pathname } = useLocation();

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
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <Popover open={openCreatePopover} onOpenChange={setOpenCreatePopover}>
        <SidebarGroupAction render={<PopoverTrigger />}>
          <PlusIcon />
        </SidebarGroupAction>
        <PopoverContent side="right" align="start">
          <form.AppForm>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
              className="flex flex-col gap-2"
            >
              <form.AppField name="name">
                {(field) => <field.TextField label="Project title" />}
              </form.AppField>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                  </>
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
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading && (
            <SidebarMenuItem>
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          )}
          {isError && (
            <SidebarMenuItem>
              <SidebarMenuButton disabled className="text-destructive">
                <AlertTriangle />
                Failed to load projects
              </SidebarMenuButton>
              <SidebarMenuAction onClick={() => refetch()}>
                <RefreshCcw className="stroke-destructive" />
              </SidebarMenuAction>
            </SidebarMenuItem>
          )}
          {!isLoading && !isError && projects && projects.length > 0 ? (
            <>
              {projects.slice(0, 5).map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    isActive={pathname.includes(`/p/${project.slug}`)}
                    render={<Link to="/p/$projectSlug" params={{ projectSlug: project.slug }} />}
                  >
                    {project.name}
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{project.slug}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
              {projects.length > 5 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.includes("/projects")}
                    render={<Link to="/projects" />}
                    className="align-center justify-between"
                  >
                    View all projects
                    <ArrowRightIcon />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>No projects</SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
