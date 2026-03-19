# Product Brief Template

Fill this before choosing a framework.

## Brief

- Product purpose:
  One sentence describing what the app does and why it exists.

- Primary user:
  The main person who uses it first.

- Core v1 workflow:
  One end-to-end action the primary user must complete in v1.

- Platform target:
  `web` / `mobile` / `desktop` / `multi-platform` / `undecided`

- Runtime shape:
  `client-first` / `needs server behavior` / `undecided`

- Auth in v1:
  `required` / `not required` / `undecided`

- Persistence in v1:
  `local only` / `remote` / `none` / `undecided`

- Minimum screens:
  List only the fewest screens needed for the core v1 workflow.

## Decision Guide

Choose `Vite + React + TypeScript` when the brief points to:

- `platform target = web`
- `runtime shape = client-first`
- `auth in v1 = not required` or simple client-managed auth
- `persistence in v1 = local only`, `none`, or remote via an external API without app-owned server behavior
- minimum screens describe a focused SPA, internal tool, dashboard, prototype, or front-end-heavy workflow

Choose `Next.js` when the brief points to:

- `platform target = web`
- `runtime shape = needs server behavior`
- auth depends on server sessions, protected routes, or request-time user context
- persistence is remote and the app needs app-owned server routes, server actions, uploads, webhooks, or request-time data work
- minimum screens include public entry pages plus authenticated app pages, or the app needs SEO-sensitive/public-facing routes

## Scaffold Rule

Do not scaffold until every field above is filled.

After the brief is filled:

- recommend `Vite + React + TypeScript` if the app is clearly a client-first web app
- recommend `Next.js` if the app clearly needs server behavior as part of the product shape
- keep the decision deferred if any of `platform target`, `runtime shape`, `auth in v1`, or `persistence in v1` is still `undecided`
