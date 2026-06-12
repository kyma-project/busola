---
name: create-compliant-pr
description: Creates a pull request that passes all busola CI checks. Use when contributing changes to kyma-project/busola from a fork. Handles fork setup, branch creation, commit, and PR body construction according to the exact rules enforced by pr-title-check, pr-description-check, pr-dod-check, and lint-check-pr workflows. Trigger keywords - "create a PR", "open a pull request", "submit my changes", "contribute this", "make a PR".
---

# Create Compliant PR

Creates a pull request against `kyma-project/busola` from a personal fork that passes all automated CI checks.

## Prerequisites

- `gh` authenticated to github.com (`gh auth status`)
- Working directory is the busola repo root
- Changes are staged or committed locally

## Step 1: Verify gh Authentication

```bash
gh auth status
```

Must show `github.com` logged in. If not, run `gh auth login`.

## Step 2: Ensure Fork Exists and Remote Is Set

```bash
# Check if myfork remote exists
git remote -v
```

If `myfork` is missing:

```bash
gh repo fork kyma-project/busola --clone=false
git remote add myfork https://github.com/<your-username>/busola.git
```

Get your username via `gh api user --jq .login`.

## Step 3: Create a Branch

Branch off `main`. Never work directly on `main`.

```bash
git checkout main
git pull origin main
git checkout -b <branch-name>
```

Branch name convention: `<type>/<short-description>` (e.g., `docs/add-agents-md`, `fix/cluster-selector-width`).

## Step 4: Commit with a Compliant Message

Commit message format: `<type>: <Subject>` (Conventional Commits).

**Allowed types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `revert`

**Subject rules:**

- Must start with an **uppercase letter** (A–Z)
- Must **not** end with a period
- Special exception: `bump ...` (lowercase, used for dependency bumps)

Valid examples:

```
feat: Add dark mode toggle
fix: Resolve cluster selector width overflow
docs: Add AGENTS.md for AI agent guidance
chore: Update Node version to 24
```

Invalid examples:

```
feat: add dark mode toggle       ← lowercase subject
fix: Resolve cluster selector.   ← ends with period
Feature: Add something           ← wrong type format
```

Never mention Claude or any AI tool in commit messages.

## Step 5: Run Lint Checks Locally Before Pushing

The `lint-check-pr` workflow runs these two commands against your merged branch. Fix any issues before pushing:

```bash
npm ci
npm run eslint-check
npm run lint-check
```

Prettier checks **all file types including `.md`**: `**/*.{ts,tsx,js,jsx,json,html,css,yaml,md}`. Any new or modified markdown file (including `AGENTS.md`, `CLAUDE.md`, docs) must be Prettier-formatted or the lint check will fail.

If `lint-check` (Prettier) fails, auto-fix with:

```bash
npm run lint-fix
git add -u && git commit -m "chore: Fix Prettier formatting"
```

If `eslint-check` fails, auto-fix with:

```bash
npm run eslint-fix
git add -u && git commit -m "chore: Fix lint issues"
```

## Step 6: Push to Fork

```bash
git push myfork <branch-name>
```

## Step 7: Open the PR with a Compliant Body

The PR body must satisfy three automated checks:

| Check                 | Rule                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description Check** | Body must contain the exact string `Changes proposed in this pull request` followed by at least one letter of content before `Related issue` |
| **DoD Check**         | All `- [ ]` checkboxes must be checked `- [x]`. Any unchecked box fails the build.                                                           |
| **PR Title Check**    | Title must match `<type>: <Subject>` with uppercase subject, no trailing period                                                              |

### 7a. Generate the title and body using `pr-description`

Invoke the `pr-description` skill (read and follow `.agents/skills/pr-description/SKILL.md`) to produce a suggested title and PR body from the branch diff and the project's pull-request template. Pass the issue number if one is known.

### 7b. Apply compliance overrides

Before opening the PR, enforce these rules on the generated output:

- **Title:** Confirm it matches `<type>: <Uppercase subject, no trailing period>`. Adjust if needed.
- **Checkboxes:** Convert every `- [ ]` to `- [x]`. If an item is genuinely incomplete, remove the checkbox and describe it in prose instead — an unchecked box anywhere in the body will fail the DoD check.

### 7c. Open the PR

```bash
gh pr create \
  --repo kyma-project/busola \
  --head <your-username>:<branch-name> \
  --base main \
  --title "<validated title>" \
  --body "$(cat <<'EOF'
<compliant body from steps 7a–7b>
EOF
)"
```

## Step 8: Apply Labels and Enable Maintainer Edits

### 8a. List available `area/` labels

```bash
gh label list --repo kyma-project/busola --limit 100 --json name \
  --jq '[.[] | .name | select(startswith("area/"))] | sort | .[]'
```

### 8b. Choose relevant labels

Based on the PR diff, select the most fitting `area/` label(s). Common choices:

| Changes touch…                   | Label(s)                    |
| -------------------------------- | --------------------------- |
| Agent skills, Claude commands    | `area/tooling`              |
| CI workflows, GitHub Actions     | `area/ci`                   |
| Kubernetes resource UI           | `area/busola`               |
| UX / design / i18n               | `area/busola/ux`            |
| Extensibility / custom resources | `area/busola/extensibility` |
| Tests                            | `area/tests`                |
| Docs only                        | `area/documentation`        |
| Dependencies                     | `area/dependency`           |

Pick at least one. When in doubt, `area/busola` covers general frontend work.

### 8c. Apply labels and enable maintainer edits

```bash
# Add the label
gh pr edit <PR-URL> \
  --repo kyma-project/busola \
  --add-label "area/<chosen>"

# Enable "Allow edits from maintainers" (gh pr edit has no flag for this — use the API)
gh api --method PATCH repos/kyma-project/busola/pulls/<PR-NUMBER> \
  -f maintain_can_modify=true
```

Replace `<PR-URL>` with the URL returned by `gh pr create`, `<chosen>` with the label from 8b, and `<PR-NUMBER>` with the numeric PR ID from that URL.

## Compliance Summary

Before submitting, verify:

- [ ] Title: `<type>: <Uppercase subject, no trailing period>`
- [ ] Zero unchecked `- [ ]` boxes anywhere in the body
- [ ] `npm run eslint-check` passes locally
- [ ] `npm run lint-check` passes locally
- [ ] PR is not in draft state (draft PRs skip lint but still appear as failing)
- [ ] `area/` label added after opening
- [ ] "Allow edits from maintainers" enabled
