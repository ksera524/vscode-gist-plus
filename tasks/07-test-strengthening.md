# Step 07: Test Strengthening

## Purpose
Guarantee behavior safety while refactoring internals.

## Target Files
- `src/**/__tests__/*.test.ts`
- `vitest.setup.ts` (if mock typing must be improved)

## Tasks
- Replace `any`-heavy test scaffolding with typed helpers.
- Add or refine edge-case tests for error and boundary paths.
- Keep tests focused on public behavior rather than internals.

## Done When
- Unit tests pass with improved type quality.
- Refactored modules have explicit behavior coverage.

## Verify
```bash
npm run test:unit
```
