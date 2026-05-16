# Step 01: Branch and Safety

## Purpose
Create safe branch isolation before refactor work.

## Tasks
- Stash local uncommitted changes from `develop`.
- Create and switch to parent branch: `refactor/strict-types-modernization`.
- Keep stash for later controlled restore into child work branch.

## Done When
- Current branch is `refactor/strict-types-modernization`.
- `git stash list` includes `wip-before-refactor-branch`.

## Verify
```bash
git branch --show-current
git stash list
git status --short
```
