# Step 06: Migrations Async Modernization

## Purpose
Modernize migration execution model and error handling.

## Target Files
- `src/migrations/migration-service.ts`
- `src/migrations/**/*.ts`

## Tasks
- Convert callback-heavy flow to Promise-based or async-friendly flow.
- Ensure migration errors propagate consistently.
- Preserve migration idempotency and applied-record semantics.

## Done When
- Migration orchestration is deterministic and testable.
- Startup path handles migration failures predictably.

## Verify
```bash
npm run test:unit
npm run compile
```
