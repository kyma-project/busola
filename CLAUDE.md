# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Skills

Agent skills for this repository are maintained in `.agents/skills/`. Each skill is a directory containing a `SKILL.md` file. When asked to perform a task that matches a skill name, read the corresponding `SKILL.md` and follow its instructions.

Available skills:

- `.agents/skills/create-compliant-pr/` — Create a PR that passes all busola CI checks

> **Note:** To expose these as native Claude Code slash commands (e.g. `/create-compliant-pr`), add a `.claude-plugin/plugin.json` pointing to `.agents/skills/` and register the repo in the Claude Code plugin registry. This gives proper slash command autocomplete without moving any files.
