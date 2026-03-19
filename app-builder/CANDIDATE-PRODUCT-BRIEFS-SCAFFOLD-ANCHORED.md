# Candidate Product Briefs (Scaffold-Anchored)

Scaffold references used:

- Vite official starter path: `npm create vite@latest <project> -- --template react-ts` and `react-ts` template in `vitejs/vite` create-vite templates.
  - https://vite.dev/guide/
  - https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
- Next.js official starter path: `create-next-app` TypeScript/App Router starter.
  - https://nextjs.org/docs/app/api-reference/cli/create-next-app
- Expo official starter path: `create-expo-app` TypeScript template path (`default` and `blank-typescript` templates).
  - https://docs.expo.dev/more/create-expo/
  - https://github.com/expo/expo/tree/main/templates/expo-template-blank-typescript

## Candidate 1 (Vite + React + TypeScript lane): Personal Habit Check-in

1. Product purpose: Help an individual track a short daily habit list in one fast web app.
2. Primary user: A single self-managed user.
3. Core v1 workflow: Add habits, mark today complete/incomplete, and view a 7-day completion summary.
4. Platform target: `web`
5. Runtime shape: `client-first`
6. Auth in v1: `not required`
7. Persistence in v1: `local only`
8. Minimum screen list:
- Today
- Edit Habits
- Weekly Summary
9. Scaffold used: Official Vite React/TS starter (`react-ts`) via `npm create vite@latest <project> -- --template react-ts`.
10. Why this scaffold is the correct fit: This v1 is a pure client SPA with no server behavior, so Vite gives the shortest path with less framework overhead than Next.js and avoids the mobile runtime/toolchain burden of Expo.
11. Biggest tradeoff of this scaffold: No built-in server surface for future authenticated or server-rendered requirements.

## Candidate 2 (Next.js + TypeScript lane): Team Request Intake Portal

1. Product purpose: Let coworkers submit internal requests and let an operations owner triage and update statuses.
2. Primary user: Operations coordinator handling incoming requests.
3. Core v1 workflow: Submit request, sign in as coordinator, review queue, open request detail, set status.
4. Platform target: `web`
5. Runtime shape: `needs server behavior`
6. Auth in v1: `required`
7. Persistence in v1: `remote`
8. Minimum screen list:
- Submit Request
- Sign In
- Request Queue
- Request Detail
9. Scaffold used: Official Next.js TypeScript starter via `create-next-app` (App Router).
10. Why this scaffold is the correct fit: This v1 needs app-owned server behavior and authenticated routes on day one, where Next.js provides a stronger default than Vite client-first scaffolding and is more suitable than Expo for browser-based internal operations workflows.
11. Biggest tradeoff of this scaffold: Higher initial complexity (server concerns, auth boundaries, deployment shape) than a client-only SPA.

## Candidate 3 (Expo + TypeScript lane): Field Visit Notes App

1. Product purpose: Let field staff capture visit notes and photos on phones during site visits.
2. Primary user: Mobile worker performing in-person visits.
3. Core v1 workflow: Sign in, start a visit entry, add text + photo, save draft locally, submit when online.
4. Platform target: `mobile`
5. Runtime shape: `client-first`
6. Auth in v1: `required`
7. Persistence in v1: `local only` (v1), with deferred cloud sync
8. Minimum screen list:
- Sign In
- Visit List
- New Visit Entry
- Visit Detail
9. Scaffold used: Official Expo TypeScript starter path via `create-expo-app` using `blank-typescript` (or `default` template when router/navigation scaffolding is preferred).
10. Why this scaffold is the correct fit: This v1 is mobile-first with device capture workflows, where Expo’s native runtime and React Native ecosystem are a better functional match than browser-first Vite or server-focused Next.js.
11. Biggest tradeoff of this scaffold: Mobile environment setup and native runtime constraints increase iteration overhead versus web-first scaffolds.

## Final Comparison

- Lowest-friction starting point for this blank repo: `Candidate 1 (Vite Personal Habit Check-in)`.
  - Reason: no auth, no remote persistence, no server behavior, and smallest screen scope.
- Fastest to get running: `Candidate 1 (Vite Personal Habit Check-in)`.
  - Reason: official Vite React/TS starter is the lightest lane for a client-only web v1.
- Strongest if mobile is the priority: `Candidate 3 (Expo Field Visit Notes App)`.
  - Reason: built around mobile runtime and on-device workflows from the first commit.
- Reject first if we want to avoid unnecessary complexity: `Candidate 2 (Next Team Request Intake Portal)`.
  - Reason: it introduces server behavior, auth, and remote persistence complexity immediately.
