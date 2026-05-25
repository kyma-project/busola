---
name: ui-text
description: Audit and fix user-visible text in public/i18n/en.yaml against Kyma content guidelines. Use /ui-text for full-file cleanup, /ui-text review for PR review of changed keys.
---

# UI Text Quality

Ensure all user-visible text in `public/i18n/en.yaml` complies with the
[Kyma UI content guidelines](https://github.com/kyma-project/community/blob/main/docs/guidelines/content-guidelines/05-ui-elements.md).

## Mode Detection

Check the argument passed when the skill was invoked:
- No argument or empty string → **Cleanup Mode** (analyze entire file)
- Argument is `review` → **Review Mode** (analyze only changed keys vs `main`)

## Key Classification

Determine a key's text type from its YAML path segments (split the full dotted key on `.`):

| If any path segment equals | Text type |
|---------------------------|-----------|
| `buttons` | button |
| `labels` or `statuses` | label |
| `headings` | heading |
| `tooltips` | tooltip |
| `messages` | message |
| `placeholders` | placeholder |
| None of the above | message (default) |

**Special case:** If the final key segment itself contains the substring `tooltip`
(e.g. `cpu-limits-tooltip`), classify as `tooltip`.

## Kyma/Kubernetes Proper Nouns

Always preserve capitalization for these names regardless of rule:
Pod, Deployment, StatefulSet, DaemonSet, ReplicaSet, Service, Ingress, ConfigMap,
Secret, Namespace, ClusterRole, ClusterRoleBinding, RoleBinding, ServiceAccount,
CronJob, Job, PersistentVolumeClaim, PersistentVolume, StorageClass, APIRule,
Function, Subscription, EventingBackend, Kyma, SAP.

## Rule Set

### Layer 1 — Mechanical Rules

**R1 — Capitalization:**

| Text type | Rule |
|-----------|------|
| `label`, `heading` | Title Case — capitalize all words except: articles (a, an, the), short prepositions (at, by, for, in, of, on, to, up), and conjunctions (and, but, or, nor). Always capitalize the first word regardless of type. |
| `button`, `message`, `tooltip`, `placeholder` | Sentence case — capitalize only the first word and proper nouns (see Kyma/Kubernetes list above). |

Skip values that consist entirely of interpolation variables (e.g. `{{count}}`).

**R2 — No punctuation in labels and buttons:**

`label`, `heading`, `button` values must not end with `.`, `!`, `?`.
(Trailing `:` is also a smell — flag with suggestion but don't auto-fix.)

**R3 — Sentence-ending punctuation:**

`message` and `tooltip` values that are complete sentences (heuristic: 5+ words,
contains a verb, does not end with a Kubernetes resource name or an interpolation
variable) must end with `.`.
Sentence fragments and very short values (fewer than 5 words) — skip.

Examples:
- `"The resource was deleted successfully"` → 5+ words, has verb → add period: `"The resource was deleted successfully."`
- `"Failed to load resources"` → fragment (no explicit subject) → skip
- `"No entries found"` → only 3 words → skip
- `"Connecting to {{clusterName}}"` → ends with interpolation variable → skip (no period required)

**R4 — No ampersand:**

Any text type: replace ` & ` with ` and `.

**R5 — No generic confirmation buttons:**

`button` values that are exactly `Yes` or `No` (case-insensitive) → flag.
Do not auto-fix; note: "Replace with an action verb (e.g. Delete, Confirm, Cancel)."

### Layer 2 — Editorial Rules

Layer 2 findings are **never auto-applied**. They are informational only.

**E1 — Error message completeness:**

`message` values containing `failed`, `error`, `couldn't`, `cannot`, `unable`,
or `invalid` (case-insensitive) that are a single clause with no guidance →
flag: "Consider adding context: what happened, why, and what the user can do."

**E2 — Tooltip length:**

`tooltip` values containing more than 2 sentence-ending punctuation marks
(`.`, `!`, `?`) → flag: "Tooltip is too long (>2 sentences). Trim or link to docs."

**E3 — Passive voice:**

`message` and `tooltip` values matching pattern `(is|are|was|were|be|been|being)\s+\w+ed`
→ flag as likely passive voice. Suggest active rewrite.
Example: "is displayed" → "displays".

**E4 — User-blaming language:**

Any value containing `you entered`, `you provided`, `you selected`, `you chose`,
`you typed`, or `you made` (case-insensitive) → flag.
Suggest object-focused rewrite: "You entered an invalid name." → "The name is invalid."

**E5 — Placeholder duplicates label:**

`placeholder` value identical to a sibling `label` key under the same YAML parent
→ flag: "Placeholder duplicates the label. Use a hint or example instead."

---

## Cleanup Mode

**Step 1 — Read file**

Read `public/i18n/en.yaml` in full.

**Step 2 — Walk and classify all keys**

Walk every leaf string value. For each value:
1. Derive the full dotted key path.
2. Classify text type using the Key Classification table.
3. Apply R1–R5.
4. Record violations as `{ key, current_value, proposed_value, rule }`.

Skip empty values. Skip values that are only interpolation variables.
For values containing HTML tags (e.g. `<0>ConfigMap</0>`, `<strong>`): apply capitalization and punctuation rules to visible text only; do not alter tag syntax or attributes.

**Step 3 — Present Layer 1 diff**

Show all proposed changes grouped by rule:

```
## Layer 1 — Mechanical Changes Proposed

### R1 — Capitalization (N changes)
| Key | Current | Proposed |
|-----|---------|----------|
| clusters.buttons.connect-cluster | Connect Cluster | Connect cluster |
| ...                               | ...             | ...             |

### R2 — No punctuation in labels (N changes)
| Key | Current | Proposed |
|-----|---------|----------|
| ... | ...     | ...      |

[R3, R4, R5 sections follow the same pattern]

**Total: N changes across M rules.**
```

Then ask:
> "Apply these N mechanical changes to `public/i18n/en.yaml`? (yes/no)"

**Step 4 — Apply if approved**

If yes: edit `public/i18n/en.yaml` applying every proposed change **except**:
- R5 violations (Yes/No buttons) — never auto-fix; they are informational only
- R2 trailing-colon flags — never auto-fix; they are informational only

If no: skip edits, but continue to Step 5.

**Step 5 — Layer 2 analysis**

Walk every leaf value again. Apply E1–E5. Collect:
`{ key, current_value, suggestion_text, rule_code }`

**Step 6 — Write editorial report**

Write to `docs/ui-text-editorial-suggestions.md`:

```markdown
# UI Text Editorial Suggestions

Generated: YYYY-MM-DD
Total suggestions: N

## E1 — Error messages missing context (N items)
| Key | Current value | Suggestion |
|-----|--------------|------------|
| ... | ...          | ...        |

## E2 — Tooltips too long (N items)
[same table format]

## E3 — Passive voice (N items)
[same table format]

## E4 — User-blaming language (N items)
[same table format]

## E5 — Placeholder duplicates label (N items)
[same table format]
```

**Step 7 — Report**

Output:
> "Layer 1: N changes applied to `public/i18n/en.yaml`.
> Layer 2: M editorial suggestions written to `docs/ui-text-editorial-suggestions.md`. Review and apply manually."

---

## Review Mode

**Step 1 — Get changed keys**

Run: `git diff main -- public/i18n/en.yaml`

Parse lines starting with `+` (excluding `+++`). To reconstruct the full dotted key path:
1. Read the full `public/i18n/en.yaml` file.
2. For each `+` line in the diff, match the changed value against the file to identify its exact key path.
3. If ambiguous (same value appears under multiple keys), use surrounding diff context lines (the indented YAML structure) to narrow down the parent path.

Example: a diff chunk like
```
 clusters:
   buttons:
+    test-key: New Value
```
maps to key path `clusters.buttons.test-key` with value `New Value`.

If no changed lines found: output "No i18n changes found in this branch." and stop.

**Step 2 — Analyze changed keys**

Apply Layer 1 rules (R1–R5) and Layer 2 rules (E1–E5) to changed keys only.

**Step 3 — Output Part A: violations summary**

```markdown
## UI Text Review

### Layer 1 — Mechanical violations (N)
| Key | Current value | Rule | Suggested fix |
|-----|--------------|------|---------------|
| ... | ...          | R1   | ...           |

### Layer 2 — Editorial suggestions (M)
| Key | Current value | Rule | Suggestion |
|-----|--------------|------|------------|
| ... | ...          | E1   | ...        |
```

If no violations at all: output "No violations found." and stop.

**Step 4 — Propose Layer 1 patch**

If there are Layer 1 violations, propose edits to `public/i18n/en.yaml` for those
keys only. Show as a diff, then ask:
> "Apply these N Layer 1 fixes to `public/i18n/en.yaml`? (yes/no)"

Apply if approved. **Layer 2 items are informational — never propose applying them.**
