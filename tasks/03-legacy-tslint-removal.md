# Step 03: Remove TSLint Legacy

## Purpose
Eliminate obsolete lint-era artifacts and suppressions.

## Target Files
- `tslint.json`
- `src/**/*.ts` (legacy `// tslint:` comments)

## Tasks
- Remove all `// tslint:` disable/enable comments from source and tests.
- Replace behavior with ESLint-native rules or typed fixes.
- Delete `tslint.json` after source is clean.

## Done When
- No `tslint` references remain in source files.
- `tslint.json` is removed.

## Verify
```bash
npm run lint
```
