# Step 02: Enforce No Any

## Purpose
Introduce strict lint guardrails for modern TypeScript.

## Target Files
- `eslint.config.mjs`

## Tasks
- Enable `@typescript-eslint/no-explicit-any` as `error` for production code.
- Keep test code migration phased if needed (temporary scoped override only).
- Add or refine related unsafe rules only if they do not create noise.

## Done When
- Lint fails when new explicit `any` is introduced in production source.
- Existing codebase has a clear path to zero violations.

## Verify
```bash
npm run lint
```
