---
name: validate-extension
description: Validate a Busola custom-resource extension against the extensibility rules in docs/contributor/extensibility/ and emit a structured findings report with suggested fixes. Accepts a file path, a directory, or a PR number. Does not edit the extension or the codebase; its only write is a timestamped Markdown report under validate-extension-reports/.
---

# Validate extension

A contributor is adding or changing a Busola **extensibility** configuration (a resource ConfigMap, a static extension, or a custom HTML/JS extension) and wants to know **"does this follow Busola's extensibility rules?"** before it reaches review or a cluster.

This skill owns the whole loop: load the rules, validate each configuration section, cross-check against the known-good examples, and emit one structured report of violations with concrete fixes.

This skill does **not** edit the extension or any repo file. Its only output written to disk is a timestamped Markdown report (step 7); otherwise it is read-only. See the Safety rule.

## Trigger

Invoked by the `/validate-extension` slash command (see `.claude/commands/validate-extension.md`), or whenever a contributor asks to validate, check, or lint an extension configuration.

## Tools

- `Read` / `Glob` / `Grep` — read the target extension, the rule docs under `docs/contributor/extensibility/`, and the known-good `examples/`.
- `Bash` — `git diff` / `gh` to resolve a branch or PR target, and to create the report directory.
- `Write` — write the timestamped report file (step 7). This is the skill's only write.

## Inputs

Parse `$ARGUMENTS` and the conversation for the target to validate:

- **A file path** — e.g. `examples/extensions/configuration/potatoes-updates-details-view.yaml`. Validate that file.
- **A directory** — e.g. `examples/pizzas/`. Validate every extension ConfigMap (`*.yaml`) in it.
- **A PR number** — e.g. `5501`. Use `gh pr diff <number> --name-only` to list changed files, then validate the extension ConfigMaps among them. Fetch file contents with `gh pr view`/`gh pr diff` or by checking out the branch read-only.

If no target is given, try to infer one in this order:

1. Extension files changed on the current branch (`git diff --name-only main...HEAD`).
2. If still ambiguous, **ask the user** which file/dir/PR to validate. Do not guess.

An "extension ConfigMap" is a Kubernetes `ConfigMap` carrying the label `busola.io/extension` (recognized values `resource`, `statics`, `wizard`), or a partial config fragment (a lone `general`/`list`/`details`/`form` document) the user points you at.

## Rule sources — load these first

The extensibility rules are **already codified** in the repo. Treat `docs/contributor/extensibility/` as the source of truth and read the relevant file when you are unsure about a schema detail. The section → doc mapping:

| Config section / topic           | Rule doc                                                              |
| -------------------------------- | --------------------------------------------------------------------- |
| Overview, ConfigMap structure    | `docs/contributor/extensibility/README.md`                            |
| `general` schema, labels/version | `docs/contributor/extensibility/120-resource-extensions.md`           |
| `list` columns                   | `docs/contributor/extensibility/20-list-columns.md`                   |
| `details` / summary              | `docs/contributor/extensibility/30-details-summary.md`                |
| `form` fields                    | `docs/contributor/extensibility/40-form-fields.md`                    |
| Display / detail widgets         | `docs/contributor/extensibility/50-list-and-details-widgets.md`       |
| Form widgets                     | `docs/contributor/extensibility/60-form-widgets.md`                   |
| `injections`                     | `docs/contributor/extensibility/70-widget-injection.md`               |
| Custom HTML/JS extensions        | `docs/contributor/extensibility/80-custom-extensions.md`              |
| `dataSources`                    | `docs/contributor/extensibility/90-datasources.md`                    |
| JSONata expressions              | `docs/contributor/extensibility/100-jsonata.md`                       |
| JSONata preset functions         | `docs/contributor/extensibility/101-jsonata-preset-functions.md`      |
| `presets`                        | `docs/contributor/extensibility/110-presets.md`                       |
| Value preprocessors              | `docs/contributor/extensibility/130-additional-sections-resources.md` |
| Static extensions                | `docs/contributor/extensibility/140-static-extensions.md`             |
| `translations`                   | `docs/contributor/extensibility/150-translations.md`                  |

**Known-good reference configurations** to cross-check against:

- `examples/pizzas/` — comprehensive resource extension (Pizza + PizzaOrder)
- `examples/extensions/` — resource extension samples
- `examples/custom-extension/` — custom HTML/JS extension
- `examples/statics/` — static extensions

## Workflow

### 1. Resolve and read the target

Resolve the input to one or more extension documents. For each ConfigMap, parse `metadata.labels` and each key under `data` (`general`, `list`, `details`, `form`, `injections`, `dataSources`, `translations`, `presets`) — each of these `data` values is itself YAML or JSON, so parse it; if one is not valid YAML/JSON, that is a finding (`error`, section = the key). A custom extension additionally carries `data.customHtml` (raw HTML) and `data.customScript` (raw JS) as **siblings of `data.general`** — read them as-is (do not YAML-parse) for the security checks in step 5.

### 2. Validate structural rules (labels & version)

- `metadata.labels."busola.io/extension"` must be **present**. Recognized values are `resource`, `statics`, and `wizard` (see `examples/`). An unrecognized value is `info`, not an error — it may be a newer extension type; verify against `docs/` rather than failing it.
- `metadata.labels."busola.io/extension-version"` must be present and be a supported version (`'0.5'` is current; only the two latest are supported).
- A `statics` extension's `general` holds only `externalNodes` and has **no** `resource` key. A `resource` extension **must** have `general.resource`. Flag a mismatch. (A `wizard` extension's `general` uses its own schema — `id`, not `resource`; check it against the wizard example rather than the resource rules.)

### 3. Validate each present `data` section

Walk every section that is present and check it against its rule doc. Do not invent requirements — anchor each finding to a doc. Minimum checks per section:

- **`general`** — `resource.kind` and `resource.version` are **required** (except `statics`). `scope`, if present, is `namespace` or `cluster`. `features.actions.*` are boolean or JSONata. Unknown top-level keys are suspicious — flag as `info`.
- **`list`** — each column has a `source` (or JSONata); any `widget` is a valid **display** widget name (see widget doc). Flag unknown widget names (likely typos).
- **`details`** — `header`/`status`/`body`/`health`/`resourceGraph` only; block widgets (`Panel`, `Table`, `Columns`, …) used only in `body`; inline widgets used where allowed; `widget` names valid.
- **`form`** — every field has a `path` (array fields use `[]` notation) **or** is a variable field (`var` + `type`); `widget` names are valid form widgets; `trigger`/`subscribe` reference consistent names.
- **`dataSources`** — each entry has a `resource` with `kind`+`version`. Note the names it defines; you will cross-check JSONata references against them.
- **`injections`** — each injection has a valid `widget`, `targets[].location`, and `targets[].slot` from the allowed sets.
- **`translations`** — keyed by language code (`en`, `de`, …); i18next structure.
- **`presets`** — each preset has a required `name` and a required `value` object (the fields applied when the preset is chosen); optional `variables` and `default`.

### 4. Cross-section checks

- **JSONata dataSource references** — a `$name()` call is a data-source reference **only** when `name` is not a JSONata built-in and not a preset function. Do **not** flag JSONata built-ins (`$join`, `$sum`, `$filter`, `$number`, `$string`, `$boolean`, `$map`, `$not`, …) or the preset functions in `101-jsonata-preset-functions.md` (`$canI`, `$compareStrings`, `$matchByLabelSelector`, `$matchEvents`, `$readableTimestamp`, `$readableTimestampWithTime`). A call that is clearly none of these and is **not** defined in `dataSources` (nor provided via a widget's `provideVar`) is an `error`. When you cannot tell whether a name is a built-in, do **not** flag it — default to no finding.
- **Translation keys** — `description` / names that look like translation IDs should resolve in `translations` (otherwise `info`: falls back to prettified path).

### 5. Security checks (always run)

- `data.customScript` / `data.customHtml` (siblings of `data.general`, **not** nested under `general`) — arbitrary JS/HTML. Flag as `warning`: they require the `EXTENSIBILITY_CUSTOM_COMPONENTS` feature flag. Flag any obvious data exfiltration, external POSTs, or `document.cookie` access as `error`.
- `$canI(...)` — signature is `canI(resourceGroupAndVersion, resourceKind)` (no verb parameter). Flag an overly broad `resourceGroupAndVersion` or `resourceKind` (e.g. a wildcard `'*'`) as `warning`.
- Any `unsafe-eval`-style pattern — flag as `error`.

### 6. Emit the structured report

Produce the report **twice**: print it inline in the chat, and write the same content to a file (see step 7).

Order findings most-severe first (`error` → `warning` → `info`). One block per finding:

```
### <file> · <section> · <severity>
- Rule: <docs/contributor/extensibility/....md[#anchor]>
- Problem: <one or two sentences naming the exact field/value>
- Fix: <concrete change — the corrected snippet or the precise edit>
```

End with a summary line:

```
## Summary — <file-or-target>
- errors: <n>  warnings: <n>  info: <n>
- Verdict: PASS (no errors) | FAIL (<n> errors)
```

If nothing is wrong, say so explicitly: `Verdict: PASS — no violations found against docs/contributor/extensibility/`.

### 7. Write the report to a file

Always write the full Markdown report (the per-finding blocks **and** the summary) to a **timestamped** file so repeated runs never overwrite each other:

```
validate-extension-reports/<target-slug>-<YYYY-MM-DD_HHMMSS>.md
```

- The folder is `validate-extension-reports/` in the current working directory (create it if missing).
- `<target-slug>` is a filesystem-safe slug of what was validated — the extension filename without extension, the directory name, or `pr-<number>` for a PR.
- Begin the file with a title line and the target + timestamp, then the findings, then the summary.
- After writing, print the report's path so the user can open it.

This report file is the **only** thing the skill writes. Do not commit it — add `validate-extension-reports/` to `.gitignore` if it is not already ignored.

## Evaluation fixture

`fixtures/broken-extension.yaml` is a deliberately rule-violating extension, and `fixtures/expected-findings.yaml` lists the findings the skill should surface against it — one entry per seeded violation, each with its section, severity, rule doc, and fix. Use it to sanity-check the skill after changing it:

```
/validate-extension .agents/skills/validate-extension/fixtures/broken-extension.yaml
```

Compare the report against `expected-findings.yaml`. This is a manual eval artifact — there is no automated test harness.

## Safety rule

Read-only toward the extension and the codebase. You investigate the extension, the docs, and the examples, but you **do not edit the extension** or any repo file — the **only** file you write is the timestamped report under `validate-extension-reports/` (step 7). If the user asks you to apply a fix after seeing the report (e.g. "fix the scope"), **stop and confirm explicitly** before editing any other file, then make only the agreed change.

## Out of scope

- Generating a brand-new extension from a description — this skill validates an existing config rather than authoring one.
- Running the extension against a live cluster — this is a static, rules-based check.
- Auto-applying fixes without explicit confirmation.

The report is **advisory**. The contributor and reviewer remain responsible for the final configuration.
