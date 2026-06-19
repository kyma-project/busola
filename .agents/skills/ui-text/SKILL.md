---
name: ui-text
description: Audit and fix user-visible text in public/i18n/en.yaml against SAP Fiori and Kyma content guidelines (Fiori takes precedence on conflicts). Use /ui-text for full-file cleanup, /ui-text review for PR review of changed keys.
---

# UI Text Quality

Ensure all user-visible text in `public/i18n/en.yaml` complies with the
[SAP Fiori UI Text Guidelines](https://www.sap.com/design-system/fiori-design-web/v1-145/foundations/writing-and-wording/ux-writing/ui-text-guidelines-for-sap-fiori) <!-- markdown-link-check-disable-line -->
and the
[Kyma UI content guidelines](https://github.com/kyma-project/community/blob/main/docs/guidelines/content-guidelines/05-ui-elements.md).

**Where the two guidelines conflict, Fiori takes precedence.**

## Mode Detection

Check the argument passed when the skill was invoked:

- No argument or empty string → **Cleanup Mode** (analyze entire file)
- Argument is `review` → **Review Mode** (analyze only changed keys vs `main`)

## Key Classification

Determine a key's text type from its YAML path segments (split the full dotted key on `.`).
**Special cases take priority** — check them first before the table:

**Special cases:**

- If the final key segment itself contains the substring `tooltip`
  (e.g. `cpu-limits-tooltip`), classify as `tooltip`.
- If the final key segment is exactly `title`
  (e.g. `clusters.empty.title`), classify as `heading`.
- If the final key segment is exactly `subtitle`, classify as `message`.

If no special case matches, use the table:

| If any path segment equals | Text type         |
| -------------------------- | ----------------- |
| `buttons`                  | button            |
| `labels` or `statuses`     | label             |
| `headings` or `headers`    | heading           |
| `tooltips`                 | tooltip           |
| `messages`                 | message           |
| `placeholders`             | placeholder       |
| None of the above          | message (default) |

## Kyma/Kubernetes Proper Nouns

Always preserve capitalization for these names regardless of rule:
Pod, Deployment, StatefulSet, DaemonSet, ReplicaSet, Service, Ingress, ConfigMap,
Secret, Namespace, ClusterRole, ClusterRoleBinding, RoleBinding, ServiceAccount,
CronJob, Job, PersistentVolumeClaim, PersistentVolume, StorageClass, APIRule,
Function, Subscription, EventingBackend, Kyma, SAP.

Plurals of protected nouns are also protected (e.g. Pods, Services).

Also always preserve capitalization for common technical acronyms and proper nouns:
Kubernetes, CPU, GPU, RAM, API, URL, URI, UUID, HTTP, HTTPS, DNS, JSON, YAML, HTML,
XML, REST, OAuth, OIDC, RBAC, JWT, TLS, SSL, SSH, CI, CD, IP, CIDR, VPC, SLA,
ID, VM, AI, UI, PV, PVC,
AWS, GCP, Azure, Nvidia, Istio, Eventing, Telemetry, Serverless, BTP, Joule, Busola,
TokenRequest, ResourceQuota, LimitRange, HorizontalPodAutoscaler, PodDisruptionBudget,
NetworkPolicy, ENTRYPOINT, CMD, JSONata, Docker,
CRD, iSCSI, CRON, ModuleTemplate,
P1, P2, P3, P4, Medium, Low, High, Critical,
Service Level Agreement, Service Level Agreements.

Plurals and common variants of the above are also protected (e.g. APIs, URLs, GPUs, CIDRs, CRs, IDs, VMs, SLAs, CRDs).

Note: compound technology standard names such as "Container Storage Interface", "Fibre Channel",
"Network File System" are proper names for industry standards — preserve their capitalization
as complete phrases, but do not add their individual component words (Container, Fibre, Channel,
Network, File, System, Interface) as standalone protected nouns.

## Rule Set

### Layer 1 — Mechanical Rules

**R1 — Capitalization:**

| Text type                               | Rule                                                                                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`, `heading`, `tooltip`, `button` | Title Case — capitalize all words except: articles (a, an, the), short prepositions (at, by, for, in, of, on, to, up), and conjunctions (and, but, or, nor). Always capitalize the first word regardless of type.                      |
| `message`, `placeholder`                | Sentence case — capitalize only the first word of each sentence and proper nouns (see Kyma/Kubernetes list above). A new sentence begins after `. `, `? `, or `! ` within the value — capitalize the first word of each such sentence. |

_Note: Fiori classifies both buttons and tooltips as title case, overriding the Kyma guideline (sentence case)._

**Exception:** `tooltip` values that contain **2 or more** sentence-ending punctuation marks
(`.` or `?`) are multi-sentence descriptive paragraphs — **skip R1 for these** (they are
already flagged by E2 as too long; the recommended fix is to shorten them, not to title-case them).

When counting sentence-ending punctuation, **exclude** `.` or `?` that appear inside quoted
strings (e.g. `'-'`, `'.'`, `'my-name'`) — these are part of example values, not sentence
boundaries. Only count punctuation that ends an actual sentence clause.

**R2 — Punctuation restrictions in UI elements:**

- `label`, `heading`, `button`, `tooltip` values must not end with `.` or `?`.
  Exception: values ending with `...` or `…` (ellipsis) — skip, the ellipsis is intentional.
- Any value (all text types) must not contain `!`. Exclamation marks are perceived as alarming or
  offensive (SAP Style Guide). Remove or rephrase.
  When removing: replace `!` followed by a space and a word with `. ` + the word capitalized (mid-sentence);
  remove a trailing `!` entirely.
  Exception: values inside quoted strings that are part of technical examples (e.g. code snippets) — skip.
  Exception: values under the `kyma-companion.*` key prefix — conversational assistant UI intentionally
  uses `!` to express enthusiasm and warmth (e.g. `"Hi, I am your Kyma assistant!"`). Skip these.

**R3 — Sentence-ending punctuation:**

`message` values that are complete sentences (heuristic: 5+ words,
contains a verb, does not end with a Kubernetes resource name or an interpolation
variable) must end with `.`.
Sentence fragments and very short values (fewer than 5 words) — skip.

Examples:

- `"The resource was deleted"` → 4 words → skip
- `"The Deployment was not found in this namespace"` → 5+ words, has verb → add period: `"The Deployment was not found in this namespace."`
- `"Failed to load resources"` → fragment (no explicit subject) → skip
- `"No entries found"` → only 3 words → skip
- `"Connecting to {{clusterName}}"` → ends with interpolation variable → skip (no period required)

**R4 — No ampersand:**

Any text type: replace `&` with `and`.

**R5 — No generic confirmation buttons:**

`button` values that are exactly `Yes` or `No` (case-insensitive) → flag.
Do not auto-fix; note: "Replace with an action verb (e.g. Delete, Confirm, Cancel)."

**R6 — No "successfully":**

Any value (all text types) containing the word `successfully` (case-insensitive) → remove the word and
adjust surrounding text to remain grammatical. If `successfully` was the first word, capitalize the new
first word.
Example: `"Configuration was saved successfully."` → `"Configuration was saved."`
Example: `"Successfully connected to the cluster."` → `"Connected to the cluster."`

**R7 — No semicolons:**

Any value (all text types) containing a semicolon (`;`) used to join sentences or phrases →
split into two separate sentences. Capitalize the first word of the new second sentence.
Example: `"File cannot be opened; check network settings."` → `"File cannot be opened. Check network settings."`

### Layer 2 — Editorial Rules

Layer 2 findings are **never auto-applied**. They are informational only.

**E1 — Error message completeness:**

`message` values containing `failed`, `error`, `couldn't`, `cannot`, `unable`,
or `invalid` (case-insensitive) that are a single clause with no guidance →
flag: "Consider adding context: what happened, why, and what the user can do."

**E2 — Tooltip length:**

`tooltip` values containing **2 or more** sentence-ending punctuation marks
(`.` or `?`) → flag: "Tooltip is too long (≥2 sentences). Trim or link to docs."

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

**E6 — "Duplicate" as a verb:**

Any value where `duplicate` is used as a verb → flag: "Use 'Copy' instead of 'Duplicate' as a verb (Fiori)."
Heuristic: flag if the value is a `button` type, or if `duplicate` appears as the first word of the value (imperative form).
Do not flag uses as a noun (e.g. "This entry is a duplicate").

**E7 — Log in / Log out wording:**

Any value containing `log in`, `log-in`, `log on`, `log off`, `log out`, `log-out`
(case-insensitive, including `Login`, `Logout`, `Log In`, `Log Out`) → flag:
"Use 'Sign In' / 'Sign Out' instead of 'Log In' / 'Log Out' (Fiori)."

**E8 — Ellipsis in placeholders:**

`placeholder` values ending with `...` or `…` → flag:
"Remove trailing ellipsis from placeholder text (Fiori: placeholders should not end with ellipsis)."

**E9 — Plural shorthand (s):**

Any value containing the pattern `\(\s*s\s*\)` (e.g. `item(s)`, `resource(s)`) → flag:
"Avoid '(s)' shorthand. Use separate singular and plural strings instead."

**E10 — Negative formulation:**

`message` values containing `not valid`, `not permitted`, `not allowed`, or `is invalid`
(case-insensitive) → flag:
"Consider a positive formulation that focuses on what the user can do (SAP Style Guide).
Example: 'Enter a future delivery date.' instead of 'The date is not valid.'"

---

## Cleanup Mode

**Step 1 — Read file**

Read `public/i18n/en.yaml` in full.

**Step 2 — Walk and classify all keys**

Walk every leaf string value. For each value:

1. Derive the full dotted key path.
2. Classify text type using the Key Classification table.
3. Apply R2–R7 only (**skip R1 in Cleanup Mode** — see note below).
4. Record violations as `{ key, current_value, proposed_value, rule }`. For R5 (informational only), omit `proposed_value`.

> **Why skip R1 in Cleanup Mode?**
> R1 (capitalization) produces ~200–300 proposed changes on a full file run, of which roughly
> 60–70% are false positives: keys classified as `message` by default that are actually rendered
> as headings, labels, or buttons in the UI (see implementation note 6). A diff of 300 changes
> is not reviewable in practice. R1 is therefore reserved for **Review Mode**, where it is applied
> only to the handful of keys changed in a given PR — a manageable set to verify manually.

Skip empty values. Skip values that consist entirely of interpolation variables (e.g. `{{count}}`).
Skip values that are **URL strings** — values that contain `://` or start with `www.` are domain/URL labels and must not be capitalized (e.g. `"help.sap.com"`, `"kyma-project.io"`).
Skip values that are **UI phrase fragments** — strings that are concatenated with other strings at runtime and therefore never displayed as a standalone sentence. A value is a phrase fragment if **either**:

- It consists of 1–3 static words (after stripping interpolation variables) AND starts with a preposition, article, conjunction, or lowercase verb (e.g. `of`, `in`, `a`, `an`, `the`, `and`, `or`, `upload`, `replace`, `uploaded`). Example: `"of {{pagesCount}}"` rendered as `"Page 1 of 5"`, or `"upload"` rendered as `"...click to upload"`.
- It starts with `or ` or `and ` (suggesting it is the second half of a sentence begun in a preceding UI element). Example: `"or paste it here:"` displayed directly below a drag-and-drop zone.

Do not apply R1 capitalization to phrase fragments.
For values that mix static text with interpolation variables (e.g. `CPU used: {{percentage}}`),
apply all rules to the static text portions only — treat `{{...}}` tokens as opaque placeholders
that must not be altered or moved.
For values containing HTML tags: this file uses only `<0>`, `</0>`, `<1>`, `</1>` (React i18n component placeholders).
Text **inside** a paired content tag (e.g. `<0>Cluster Role Binding</0>`) is a highlighted term — preserve it exactly as-is, do not apply R1 to it.
Apply R1 only to static text **outside** the tag pairs. Do not alter tag syntax.

> **Implementation note:** Use `grep`, `python3`, or `bash` scripts to scan the file
> programmatically — do not read the file line-by-line in plain text. A 1500-line YAML
> file analyzed manually in LLM context is slow and error-prone. Example: use `grep -n`
> to find R4/R6 candidates instantly, and a Python script to walk the YAML tree for R1/R2/R3.
> For YAML block scalars (lines following a `|` or `>` key), collect all continuation lines
> as part of that key's value before applying rules.
>
> **Sentence-start detection edge cases for R1 sentence case:**
>
> 1. **Value starts with `{{var}}`** — the interpolation variable counts as content. The first
>    static word after it is mid-sentence, not a sentence start. Do NOT capitalize it.
>    Example: `"{{resourceType}} set for deletion"` → no change (not `"{{resourceType}} Set for deletion"`).
> 2. **Value starts with `<0>content</0>`** — the content inside the tag counts as the sentence
>    start. The first static word after the closing tag is mid-sentence.
>    Example: `"<0>Helm Release</0> tracks the installed charts."` → no change to `tracks`.
> 3. **`WORD: ` label prefix** — if a value begins with an all-caps word followed by `: `
>    (e.g. `CAUTION: The Service Level...`), treat the text after `: ` as a new sentence start.
>    The all-caps word is a label/emphasis prefix, not part of the sentence.
> 4. **Colon as sentence boundary** — within a value, a `: ` after a complete phrase signals
>    that the following text starts a new clause. Capitalize the first word after `: ` only if
>    it would otherwise be a sentence start (i.e. the colon follows the very first word/label).
>    Do not capitalize every word after every colon (e.g. `"Parse error: {{error}}, previous..."` — `previous` stays lowercase).
> 5. **Boolean/code literals** — values like `true`, `false`, `null`, `default` that appear as
>    code or configuration values inside a sentence (e.g. `"(default: false)"`, `"If true, the..."`)
>    must not be capitalized by R1. Skip capitalization for words that are clearly boolean/code literals.
> 6. **Classification limitation** — The YAML key path is a heuristic, not a guarantee. Some
>    keys classified as `message` (default) are actually rendered as headings in the UI via
>    `<Title>`, `titleText=`, or `headerText=` props. These keys are typically short (2–4 words),
>    imperative or noun-phrase shaped (e.g. `"Provide Kubeconfig"`, `"Scan Result"`, `"Cascade Delete"`),
>    and already in Title Case. Do **not** change them to sentence case — verify by grepping for the
>    key in `src/` to confirm its render context before flagging a capitalization change.
> 7. **Technology standard names as values** — some values are displayed as the content of a
>    `LayoutPanelRow` `value=` prop (not a label), but represent official standard/technology names
>    such as `"Container Storage Interface"`, `"Fibre Channel"`, `"Network File System"`, `"iSCSI"`.
>    These are proper nouns and must retain their standard capitalization regardless of text type.
>    Add them to the protected nouns list.
> 8. **Multi-rule conflict resolution** — when a key violates multiple rules, apply them in this order
>    to produce the correct final value:
>    1. R7 (semicolon split) — restructures the sentence first
>    2. R3 (add period) — applied to the restructured sentence
>    3. R1 (capitalization) — applied to the result
>    4. R2 (remove trailing `.` or `?`) — applied last, after capitalization
>       Example: `"Couldn't load ID; config not changed"` → R7: `"Couldn't load ID. Config not changed"` →
>       R3: `"Couldn't load ID. Config not changed."` → R1: no change → R2: no trailing punct → done.
> 9. **Button name references in messages** — when a `message` value references a button by name
>    (e.g. `"Click Load Resources after selecting..."`), the button name must use the same
>    capitalization as the button itself (Title Case). Do not apply sentence-case lowercasing to
>    inline button-name references.

**Step 3 — Present Layer 1 diff**

Show all proposed changes grouped by rule:

```
## Layer 1 — Mechanical Changes Proposed

### R1 — Capitalization (N changes)
| Key | Current | Proposed |
|-----|---------|----------|
| clusters.messages.connection-failed | Error Connecting To Cluster | Error connecting to cluster |
| ...                               | ...             | ...             |

### R2 — Punctuation restrictions (N changes)
| Key | Current | Proposed |
|-----|---------|----------|
| ... | ...     | ...      |

[R3, R4, R6, R7 sections follow the same pattern; R2 exclamation mark violations are listed under R2]

### R5 — Generic confirmation buttons (N flags)
| Key | Current |
|-----|---------|
| ... | Yes     |

_R5 violations have no proposed value — they are informational flags only. Do not include them in the change count._

**Total: N changes across M rules.**
```

Then ask:

> "Apply these N mechanical changes to `public/i18n/en.yaml`? (yes/no)"

**Step 4 — Apply if approved**

If yes: edit `public/i18n/en.yaml` applying every proposed change **except**:

- R5 violations (Yes/No buttons) — never auto-fix; they are informational only

If no: skip edits, but continue to Step 5.

**Step 5 — Layer 2 analysis**

Walk every leaf value again. Apply E1–E10. Collect:
`{ key, current_value, suggestion_text, rule_code }`

**Step 6 — Write editorial report**

Write to `docs/ui-text-editorial-suggestions.md`:

```markdown
# UI Text Editorial Suggestions

Generated: YYYY-MM-DD
Total suggestions: N

## E1 — Error messages missing context (N items)

| Key | Current value | Suggestion |
| --- | ------------- | ---------- |
| ... | ...           | ...        |

## E2 — Tooltips too long (N items)

[same table format]

## E3 — Passive voice (N items)

[same table format]

## E4 — User-blaming language (N items)

[same table format]

## E5 — Placeholder duplicates label (N items)

[same table format]

## E6 — "Duplicate" as a verb (N items)

[same table format]

## E7 — Log in / Log out wording (N items)

[same table format]

## E8 — Ellipsis in placeholders (N items)

[same table format]

## E9 — Plural shorthand (s) (N items)

[same table format]

## E10 — Negative formulation (N items)

[same table format]
```

**Step 7 — Report**

Output:

> "Layer 1: N changes applied to `public/i18n/en.yaml`.
> Layer 2: M editorial suggestions written to `docs/ui-text-editorial-suggestions.md`. Review and apply manually."

---

## Review Mode

**Step 1 — Get changed keys**

Run: `git diff main...HEAD -- public/i18n/en.yaml`

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

Apply Layer 1 rules (R1–R7) and Layer 2 rules (E1–E10) to changed keys only.

**Step 3 — Output Part A: violations summary**

```markdown
## UI Text Review

### Layer 1 — Mechanical violations (N)

| Key | Current value | Rule | Suggested fix |
| --- | ------------- | ---- | ------------- |
| ... | ...           | R1   | ...           |

### Layer 2 — Editorial suggestions (M)

| Key | Current value | Rule | Suggestion |
| --- | ------------- | ---- | ---------- |
| ... | ...           | E1   | ...        |
```

If no violations at all: output "No violations found." and stop.

**Step 4 — Propose Layer 1 patch**

If there are Layer 1 violations, propose edits to `public/i18n/en.yaml` for those
keys only. Show as a diff, then ask:

> "Apply these N Layer 1 fixes to `public/i18n/en.yaml`? (yes/no)"

Apply if approved, **except**:

- R5 violations (Yes/No buttons) — never auto-fix; they are informational only

**Layer 2 items are informational — never propose applying them.**
