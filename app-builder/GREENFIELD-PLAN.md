# Greenfield Plan

## Verified Workspace State

- The workspace root is effectively blank.
- The only existing project folder is `app-builder/`.
- `app-builder/` contains the local skill files only:
  - `SKILL.md`
  - `agents/openai.yaml`
  - `references/platform-selection.md`
- No application source files, package manifest, lockfile, config, or existing architecture are present.

## Product Definition Status

No product identity is defined by the current files. There is no evidence yet for:

- target user
- problem being solved
- required platforms
- must-have MVP flow
- backend or integration requirements

Because this is a blank greenfield repo, the correct starting point is to define the smallest truthful product baseline instead of fabricating domain details.

## Greenfield Baseline

- Product identity: not yet defined
- Primary user: not yet defined
- Core job to be done: not yet defined
- Delivery target: not yet defined
- MVP scope rule: support exactly one core user workflow in v1
- Backend rule: defer backend and framework selection until the brief is explicit

## Framework Selection Rule

Do not choose a scaffold from the current repo state alone.

Use [PRODUCT-BRIEF-TEMPLATE.md](./PRODUCT-BRIEF-TEMPLATE.md) to force the minimum decisions before framework selection.

## Sequential Next Steps

1. Fill [PRODUCT-BRIEF-TEMPLATE.md](./PRODUCT-BRIEF-TEMPLATE.md).
2. Confirm the core v1 workflow and minimum screen list.
3. Use the filled brief to choose between `Vite + React + TypeScript`, `Next.js`, or continued deferral.
4. Scaffold only after the framework choice is justified by the brief.
