---
name: validate-extension
description: Validate a Busola custom-resource extension against the extensibility rules in docs/contributor/extensibility/ and emit a structured findings report with suggested fixes. Accepts a file path, a directory, or a PR number. Read-only — investigates and reports, never edits the extension.
---

# Validate extension

A contributor is adding or changing a Busola **extensibility** configuration (a resource ConfigMap, a static extension, or a custom HTML/JS extension) and wants to know **"does this follow Busola's extensibility rules?"** before it reaches review or a cluster.

This skill owns the whole loop: load the rules, validate each configuration section, cross-check against the known-good examples, and emit one structured report of violations with concrete fixes.

The assessment is **read-only**. You investigate the extension and the repo but you do **not** edit the extension. See the Safety rule.

## Inputs

Parse `$ARGUMENTS` and the conversation for the target to validate:

- **A file path** — e.g. `examples/extensions/configuration/potatoes-updates-details-view.yaml`. Validate that file.
- **A directory** — e.g. `examples/pizzas/`. Validate every extension ConfigMap (`*.yaml`) in it.
- **A PR number** — e.g. `5501`. Use `gh pr diff <number> --name-only` to list changed files, then validate the extension ConfigMaps among them. Fetch file contents with `gh pr view`/`gh pr diff` or by checking out the branch read-only.

If no target is given, try to infer one in this order:

1. Extension files changed on the current branch (`git diff --name-only main...HEAD`).
2. If still ambiguous, **ask the user** which file/dir/PR to validate. Do not guess.

An "extension ConfigMap" is a Kubernetes `ConfigMap` carrying the label `busola.io/extension` (value `resource` or `statics`), or a partial config fragment (a lone `general`/`list`/`details`/`form` document) the user points you at.

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

Resolve the input to one or more extension documents. For each ConfigMap, parse `metadata.labels` and each key under `data` (`general`, `list`, `details`, `form`, `injections`, `dataSources`, `translations`, `presets`). Each `data` value is itself YAML or JSON — parse it. If a `data` section is not valid YAML/JSON, that is itself a finding (`error`, section = the key).

### 2. Validate structural rules (labels & version)

- `metadata.labels."busola.io/extension"` must be present and be `resource` or `statics`.
- `metadata.labels."busola.io/extension-version"` must be present and be a supported version (`'0.5'` is current; only the two latest are supported).
- A `statics` extension's `general` holds only `externalNodes` and has **no** `resource` key. A `resource` extension **must** have `general.resource`. Flag a mismatch.

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

- **JSONata dataSource references** — scan `source`/`filter`/`link`/`visibility` for `$someName()` calls and verify each `someName` is defined in `dataSources`. An undefined reference is an `error`.
- **Translation keys** — `description` / names that look like translation IDs should resolve in `translations` (otherwise `info`: falls back to prettified path).

### 5. Security checks (always run)

- `general.customScript` / `customHtml` — arbitrary JS/HTML. Flag as `warning`: requires the `EXTENSIBILITY_CUSTOM_COMPONENTS` feature flag, and flag any obvious data exfiltration, external POSTs, or `document.cookie` access as `error`.
- `$canI(...)` usage with overly broad verbs/resources (`'*'`) — flag as `warning`.
- Any `unsafe-eval`-style pattern — flag as `error`.

### 6. Emit the structured report

Emit **one** report. Order findings most-severe first (`error` → `warning` → `info`). One block per finding:

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

## Safety rule

Read-only. You investigate the extension, the docs, and the examples, but you **do not edit the extension**. If the user asks you to apply a fix after seeing the report (e.g. "fix the scope"), **stop and confirm explicitly** before editing any file, then make only the agreed change.

## Out of scope

- Generating a brand-new extension from a description — this skill validates an existing config rather than authoring one.
- Running the extension against a live cluster — this is a static, rules-based check.
- Auto-applying fixes without explicit confirmation.

The report is **advisory**. The contributor and reviewer remain responsible for the final configuration.
