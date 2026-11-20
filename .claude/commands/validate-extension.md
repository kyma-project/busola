---
description: Validate a Busola custom-resource extension against the extensibility rules and emit a structured findings report with fixes
argument-hint: '<file-path | directory | PR-number>'
allowed-tools: Read, Grep, Glob, Bash
---

Read `.agents/skills/validate-extension/SKILL.md` and follow it. Parse `$ARGUMENTS` for the target to validate (a file path, a directory, or a PR number). If no target is given, infer it from the current branch's changed extension files; if still ambiguous, ask the user before proceeding.

The assessment is read-only — report findings, do not edit the extension unless the user explicitly asks after seeing the report.

## Usage

```
/validate-extension examples/pizzas/              → validate every extension ConfigMap in a directory
/validate-extension path/to/configmap.yaml        → validate one extension file
/validate-extension 5501                           → validate the extension configs changed in PR #5501
/validate-extension                                → infer target from the current branch
```
