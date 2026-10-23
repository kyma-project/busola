---
description: Safely bump a single npm dependency — fetches the changelog, checks for breaking changes, scans the codebase, and runs lint/typecheck.
argument-hint: '<package> [version] [workspace]'
---

Read `.agents/skills/bump-dependency/SKILL.md` and follow it. Parse `$ARGUMENTS` for the package name, optional target version, and optional workspace (`root`, `backend`, or `tests`). If the package name is missing, ask the user before proceeding.

## Usage

```
/bump-dependency express-rate-limit 7.0.0 backend
    → bump express-rate-limit to 7.0.0 in backend/package.json

/bump-dependency react
    → bump react to latest in root package.json
```
