# Candidate Product Briefs

## Candidate 1: Personal Routine Tracker

1. Product purpose: Help one person track a small set of daily and weekly routines from a browser.
2. Primary user: An individual user managing personal routines.
3. Core v1 workflow: Create a routine, mark items complete for today, and review completion status.
4. Platform target: `web`
5. Runtime shape: `client-first`
6. Auth in v1: `not required`
7. Persistence in v1: `local only`
8. Minimum screen list:
   - Today
   - Manage Routines
   - Weekly Review
9. Recommended scaffold choice: `Vite + React + TypeScript`
10. Reason: The app is a small client-first SPA with no server-owned behavior, no required auth, and browser-local persistence.

## Candidate 2: Team Request Intake Board

1. Product purpose: Let a small internal team collect, triage, and track incoming work requests from coworkers.
2. Primary user: An operations teammate responsible for reviewing and updating requests.
3. Core v1 workflow: A coworker submits a request, an ops user signs in, reviews it in a queue, and updates its status.
4. Platform target: `web`
5. Runtime shape: `needs server behavior`
6. Auth in v1: `required`
7. Persistence in v1: `remote`
8. Minimum screen list:
   - Submit Request
   - Sign In
   - Request Queue
   - Request Detail
9. Recommended scaffold choice: `Next.js`
10. Reason: The app needs public and authenticated routes, server-owned request handling, and shared remote persistence from the start.

## Candidate 3: Book Club Voting Board

1. Product purpose: Let members of a small book club suggest books and vote on what to read next.
2. Primary user: A signed-in club member.
3. Core v1 workflow: Sign in, submit a book suggestion, and vote on existing suggestions.
4. Platform target: `web`
5. Runtime shape: `client-first`
6. Auth in v1: `required`
7. Persistence in v1: `remote`
8. Minimum screen list:
   - Sign In
   - Suggestion Board
   - Add Suggestion
9. Recommended scaffold choice: `Vite + React + TypeScript`
10. Reason: The app can stay a client-first SPA even with auth and remote data if v1 uses a managed backend and avoids app-owned server logic.

## Lowest-Friction Starting Point

Lowest-friction option: `Candidate 1: Personal Routine Tracker`

Why:

- No auth in v1
- No remote persistence in v1
- No server behavior in v1
- Smallest screen count and simplest state model
- Fastest path to a usable first scaffold in a blank repo
