# /ui-text

Audit and fix user-visible text in `public/i18n/en.yaml` against Kyma content guidelines.

Usage:

- `/ui-text` — cleanup mode: analyze entire file, propose mechanical fixes, generate editorial report
- `/ui-text review` — PR review mode: analyze only changed keys in current branch vs main

Read and follow the instructions in `.agents/skills/ui-text/SKILL.md`.
Pass any argument provided (e.g. `review`) to the skill as the invocation mode.
