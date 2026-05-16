# Refactor Program Overview

## Goal
- Enforce strict typing (no `any`) in production code.
- Remove legacy TSLint assets and comments.
- Modernize service design and migration flow.
- Preserve behavior with sufficient tests.

## Scope
- Code under `src/`.
- Tooling in `eslint.config.mjs`, `package.json`, and lint/test scripts.
- Legacy assets including `tslint.json` and `tslint` suppression comments.

## Working Style
- Make small, reviewable changes by step.
- Keep tests green at each step.
- Prefer explicit types, dependency injection, and predictable async flows.

## Global Exit Criteria
- `npm run lint` passes.
- `npm run test:unit` passes.
- `npm run compile` passes.
- No `tslint` comments remain in `src/`.
- No explicit `any` remains in production code.
