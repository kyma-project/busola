# Skill: review-pr

Review a pull request's changes against the requirements and acceptance criteria of the linked GitHub issue. Evaluates whether the implementation fulfils the _intent_ of the issue — not just whether the code is technically correct.

## Input

Accepts a GitHub pull request number as an argument (e.g. `/review-pr 1234`).

If no number is provided, try to infer it automatically in this order:

1. The current branch name — look for an open PR associated with it via `gh pr view`.
2. If still not found, ask the user to supply the PR number before continuing.

## Step-by-step instructions

### 1 — Fetch PR details and extract the linked issue number

Using the GitHub MCP tool (preferred) or `gh pr view <number> --json number,title,body,headRefName`, retrieve the PR body.

Scan the PR body for a **Related issue(s)** section (or similar headings like "Related Issues", "Fixes", "Closes"). Extract the GitHub issue number(s) referenced there (e.g. `#1234`, `https://github.com/.../issues/1234`).

If no linked issue is found in the PR description, ask the user to supply the issue number before continuing.

### 2 — Fetch issue details

Using the GitHub MCP tool (preferred) or `gh issue view <number> --json title,body,labels,milestone`, retrieve:

- **Title**
- **Body** (description, requirements, acceptance criteria — the full markdown text)
- **Labels** (e.g. `bug`, `feature`, `UX`)

Parse the body carefully. Issues in this repo often contain:

- A free-form description of the problem or feature
- An explicit **Acceptance Criteria** section (markdown checklist or numbered list)
- Screenshots, or links that hint at expected UI/UX behaviour

Extract every requirement or acceptance-criteria item into a structured list. If no explicit AC section exists, derive implicit requirements from the description.

### 3 — Collect changed files and diff from the PR

Using the GitHub MCP tool (preferred) or the `gh` CLI, retrieve the list of files changed in the PR and the full diff:

```bash
gh pr diff <number>
gh pr view <number> --json files
```

Also collect the list of commits on the PR:

```bash
gh pr view <number> --json commits
```

### 4 — Review against issue requirements

For each requirement / acceptance-criteria item extracted in step 2, evaluate whether the diff addresses it. Produce a verdict for each item:

- **Fulfilled** — the change clearly implements or satisfies the item.
- **Partially fulfilled** — the change makes progress but leaves gaps; explain what is missing.
- **Not addressed** — no evidence in the diff; flag as a potential gap.
- **Not applicable** — the item is a process/infra concern outside the scope of this diff (e.g. "update docs" when no docs were added) — note it for human review.

Also look for:

- **Scope creep** — changes unrelated to the issue that landed in the same PR.
- **Regressions** — modifications to existing functionality not covered by the issue.
- **Missing tests** — acceptance criteria that imply test coverage where none was added.
- **UI/UX alignment** — if the issue references a mockup or describes specific UI behaviour, flag any divergence in the changed components.

### 5 — Produce structured review output

Emit the review in the following format (Markdown):

```
## Issue Review: #<number> — <title>

### Requirements Checklist
| # | Requirement | Verdict | Notes |
|---|-------------|---------|-------|
| 1 | <item>      | ✅ Fulfilled / ⚠️ Partial / ❌ Not addressed / ➖ N/A | <brief explanation> |
...

### Gaps & Concerns
<Bullet list of anything that warrants follow-up: missing coverage, scope creep, regressions, open questions.>
*(Omit this section if there are no concerns.)*

### Verdict
**<LGTM | Needs work | Blocked>** — <one sentence rationale>
```

Verdicts:

- **LGTM** — all acceptance criteria are fulfilled, no blocking gaps.
- **Needs work** — one or more criteria are partially fulfilled or not addressed but the overall direction is correct.
- **Blocked** — the implementation contradicts the issue intent, or a critical requirement is entirely absent.

## Notes

- Focus on _intent fulfilment_, as well as code style. Check if the code is following good practices.
- Do not repeat generic code-review advice (e.g. "add error handling") unless the issue explicitly requires it.
- Keep the review actionable: every gap should indicate what specifically needs to change.
- If the issue body is empty or the issue cannot be fetched, say so clearly and fall back to a plain diff review with a caveat.
