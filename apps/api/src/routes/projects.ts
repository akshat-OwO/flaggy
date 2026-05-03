import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HonoContext } from "..";
import z from "zod";
import { Effect, Either } from "effect";
import { AlreadyExistsError, database, DatabaseError, DatabaseValidationError } from "../lib/db";
import { projects as projectsTable, environments as environmentsTable } from "@flaggy/db/schema";
import { and, eq } from "@flaggy/db";
import { HTTPException } from "hono/http-exception";

const app = new Hono<HonoContext>()
  .use("*", async (c, next) => {
    const session = c.get("session");
    if (!session) throw new HTTPException(401, { message: "Unauthorized" });
    await next();
  })
  .get("/fetch", async (c) => {
    const session = c.var.session!;

    const program = Effect.gen(function* () {
      const projects = yield* Effect.tryPromise({
        try: () =>
          database.select().from(projectsTable).where(eq(projectsTable.createdBy, session.user.id)),
        catch: (error) => new DatabaseError({ message: "Failed to fetch projects", error }),
      });
      return projects;
    }).pipe(
      Effect.catchTag("DatabaseError", (error) => {
        console.log("DATABASE ERROR", error);
        return Effect.fail(error.message);
      }),
    );

    const result = await Effect.runPromise(Effect.either(program));

    if (Either.isLeft(result)) {
      throw new HTTPException(500, { message: result.left });
    }

    return c.json(result.right);
  })
  .post(
    "/create",
    zValidator(
      "form",
      z.object({
        name: z.string().min(4, { error: "Project name should be atleast 4 characters long." }),
      }),
    ),
    async (c) => {
      const session = c.var.session!;
      const { name } = c.req.valid("form");

      const program = Effect.gen(function* () {
        const generatedSlug = name.slice(0, 4).toUpperCase();

        const [existingProject] = yield* Effect.tryPromise({
          try: () =>
            database
              .select()
              .from(projectsTable)
              .where(
                and(
                  eq(projectsTable.createdBy, session.user.id),
                  eq(projectsTable.slug, generatedSlug),
                ),
              )
              .limit(1),
          catch: (error) => new DatabaseError({ message: "Failed to create project", error }),
        });

        if (existingProject)
          return yield* Effect.fail(
            new DatabaseValidationError({ message: "Project with the same slug already exists" }),
          );

        yield* Effect.tryPromise({
          try: () =>
            database.transaction(async (tx) => {
              const [existingProject] = await tx
                .select()
                .from(projectsTable)
                .where(
                  and(
                    eq(projectsTable.createdBy, session.user.id),
                    eq(projectsTable.slug, generatedSlug),
                  ),
                )
                .limit(1);

              if (existingProject)
                throw new AlreadyExistsError("Project with the same slug already exists");

              const [{ insertedId }] = await tx
                .insert(projectsTable)
                .values({
                  id: crypto.randomUUID(),
                  name,
                  slug: generatedSlug,
                  createdBy: session.user.id,
                })
                .returning({ insertedId: projectsTable.id });
              await tx.insert(environmentsTable).values([
                {
                  id: crypto.randomUUID(),
                  projectId: insertedId,
                  key: "development",
                },
                {
                  id: crypto.randomUUID(),
                  projectId: insertedId,
                  key: "production",
                },
              ]);
            }),
          catch: (error) => {
            if (error instanceof AlreadyExistsError) {
              return new DatabaseValidationError({
                message: "Project with same slug already exists.",
              });
            }
            return new DatabaseError({ message: "Failed to create project", error });
          },
        });
      });

      const result = await Effect.runPromise(Effect.either(program));

      if (Either.isLeft(result)) {
        if (result.left._tag === "DatabaseValidationError") {
          throw new HTTPException(400, { message: result.left.message });
        }
        throw new HTTPException(500, { message: result.left.message });
      }

      return c.json({ message: "Successfully created project" });
    },
  );

export default app;
