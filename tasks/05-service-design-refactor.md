# Step 05: Service Design Refactor

## Purpose
Reduce legacy mutable-singleton patterns and improve testability.

## Target Files
- `src/gists/gists-service.ts`
- `src/profiles/profile-service.ts`
- `src/typings/services.d.ts`

## Tasks
- Move from mutable global configuration toward explicit dependency handling.
- Keep externally visible behavior stable.
- Ensure services can be tested without global state coupling.

## Done When
- Service construction and configuration flow is explicit.
- Tests do not rely on fragile private-state assumptions.

## Verify
```bash
npm run test:unit
npm run compile
```
