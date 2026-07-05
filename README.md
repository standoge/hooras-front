# Hooras — Social Hours Platform Frontend

React + TypeScript frontend for the Social Hours Platform, built on the Hooras design system.

## Setup

```bash
pnpm install
cp .env.example .env
```

Configure `VITE_API_BASE_URL` in `.env` (defaults to `https://social-hours.example.edu`).

## API types

`openapi.yml` is imported from the backend project and is the source of truth. TypeScript types are generated once and committed to `src/api/schema.ts`.

When `openapi.yml` changes, regenerate manually:

```bash
pnpm exec openapi-typescript openapi.yml -o src/api/schema.ts
```

There is no `gen:api` npm script — regeneration is intentional and manual.

## Development

```bash
pnpm dev
```

On first visit to a fresh backend instance, the app redirects to `/setup` for the configuration wizard (connectors, modules, admin account).

## Build & lint

```bash
pnpm build
pnpm lint
```

## Features

- JWT auth with role-based navigation (top navbar with flyout menus)
- React Query data layer over a typed fetch client
- Core flows: dashboard, profile, projects, applications, assignments, hour logs, documents, rules, reports, certificates

## Stack

- Vite, React 19, TypeScript
- TanStack Router + React Query
- Radix UI primitives, Tailwind CSS v4
- TipTap rich text editor
