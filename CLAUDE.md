# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Skills

Agent skills for this repository are maintained in `.agents/skills/`. Each skill is a directory containing a `SKILL.md` file. When asked to perform a task that matches a skill name, read the corresponding `SKILL.md` and follow its instructions.

Available skills:

- `.agents/skills/create-compliant-pr/` — Create a PR that passes all busola CI checks
- `.agents/skills/pr-description/` — Generate a PR description from the project template
- `.agents/skills/ui-text/` — Audit and fix user-visible text in `public/i18n/en.yaml` against Kyma content guidelines (`/ui-text` for full-file cleanup, `/ui-text review` for PR review)
- `.agents/skills/review-code/` — Review current branch changes against a GitHub issue's requirements and acceptance criteria

> **Note:** To expose these as native Claude Code slash commands (e.g. `/create-compliant-pr`), place a markdown file per skill in `.claude/commands/` (e.g. `.claude/commands/create-compliant-pr.md`).
