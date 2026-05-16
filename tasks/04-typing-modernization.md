# Step 04: Typing Modernization

## Purpose
Replace weak typing and global legacy declarations with strict types.

## Target Files
- `src/typings/*.d.ts`
- Type-heavy modules in `src/gists/`, `src/profiles/`, and `src/listeners/`

## Tasks
- Replace `any` with concrete types or `unknown` plus narrowing.
- Improve function signatures such as `CommandFn` and `ListenerFn`.
- Remove avoidable unsafe type assertions.

## Done When
- Production code has no explicit `any`.
- Core public APIs have strict, readable signatures.

## Verify
```bash
npm run lint
npm run compile
```
