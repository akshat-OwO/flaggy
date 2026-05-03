# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Flaggy is a feature flag management platform (monorepo). It has:
- **API** (`apps/api`): Hono backend on Cloudflare Workers, port `8787` via `wrangler dev`
- **Dashboard** (`apps/dash`): React SPA (TanStack Router + React Query), port `3000` via `vp dev --port 3000`
- **Shared packages**: `@flaggy/db` (Drizzle + libSQL/Turso), `@flaggy/auth` (better-auth), `@flaggy/ui` (component library)

### Key commands

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Lint + typecheck + format | `vp check` (or `npx vp check`) |
| Build all | `npx vp run -r build` |
| Dev (all in parallel) | `pnpm run dev` |
| Dev API only | `pnpm --filter api dev` |
| Dev Dashboard only | `pnpm --filter dash dev` |
| Build UI package | `pnpm --filter @flaggy/ui build` |
| DB migrations | `pnpm --filter @flaggy/db db:migrate` |

### Local development prerequisites

1. **Node.js >=22.12.0** via nvm: `export NVM_DIR="/home/ubuntu/.nvm" && . "$NVM_DIR/nvm.sh"`
2. **pnpm 10.33.1** via corepack (activated during `pnpm install`)
3. **Local libSQL server** for database: install Turso CLI (`curl -sSfL https://get.tur.so/install.sh | bash`) then run `turso dev --port 8081`
4. **`apps/api/.dev.vars`** must exist (not committed). Minimum content for local dev:
   ```
   DATABASE_URL=http://127.0.0.1:8081
   DATABASE_AUTH_TOKEN=local-dev-token
   BETTER_AUTH_URL=http://localhost:8787
   BETTER_AUTH_SECRET=dev-secret-key-for-local-testing-only
   GOOGLE_CLIENT_ID=placeholder-google-client-id
   GOOGLE_CLIENT_SECRET=placeholder-google-client-secret
   ```
5. Run migrations: `pnpm --filter @flaggy/db db:migrate`

### Running the full dev stack

1. Start Turso local DB: `turso dev --port 8081` (runs in foreground; use a separate terminal)
2. Write `apps/api/.dev.vars` (see prerequisites above). Use env vars `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if available.
3. Run migrations: `pnpm --filter @flaggy/db db:migrate`
4. Start everything: `pnpm run dev` (or start API and dashboard individually)

### Non-obvious caveats

- The **UI package must be built** before the dashboard can start (`pnpm --filter @flaggy/ui build`). In parallel dev mode (`pnpm run dev`), it runs in watch mode automatically.
- The `turso dev` server uses an **ephemeral database** by default. Use `turso dev --db-file ./local.db` if you need persistence across restarts.
- **No test scripts** are defined in any package yet. `vp check` (lint + typecheck + format) is the primary code validation tool.
- CORS on the API is hardcoded to allow `http://localhost:3000` (the dashboard dev server origin).
- Authentication is Google OAuth only. For local development without real Google credentials, the auth endpoints still function (health check, session check) but actual sign-in requires valid `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- The `pnpm.onlyBuiltDependencies` field in root `package.json` allows build scripts for `esbuild`, `workerd`, `sharp`, and `msw`.
- Wrangler dev uses the `x` key to exit. After changing `.dev.vars`, restart the API server manually (wrangler does not hot-reload env changes).
- The Turso CLI binary installs to `~/.turso/`. Add it to PATH: `export PATH="$HOME/.turso:$PATH"`.
