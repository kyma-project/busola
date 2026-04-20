---
name: create-compliant-pr
description: Creates a pull request that passes all busola CI checks. Use when contributing changes to kyma-project/busola from a fork. Handles fork setup, branch creation, commit, and PR body construction according to the exact rules enforced by pr-title-check, pr-description-check, pr-dod-check, and lint-check-pr workflows. Trigger keywords - "create a PR", "open a pull request", "submit my changes", "contribute this", "make a PR".
---

# Create Compliant PR

Creates a pull request against `kyma-project/busola` from a personal fork that passes all automated CI checks.

## Prerequisites

- `gh` authenticated to github.com (`gh auth status`)
- Working directory is `/Users/D061255/Repos/busola` (or the busola repo root)
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

Use this template exactly — do not rename the section headers:

```bash
gh pr create \
  --repo kyma-project/busola \
  --head <your-username>:<branch-name> \
  --base main \
  --title "<type>: <Subject starting with uppercase>" \
  --body "$(cat <<'EOF'
## Changes proposed in this pull request

- <Describe what changed and why>
- <Add more bullet points as needed>

## Related issue

<!-- Reference with: Resolves #123, Fixes #43, or N/A -->
N/A

## Definition of done

- [x] PR title uses an allowed type prefix (feat/fix/docs/refactor/test/chore/revert)
- [x] PR title subject starts with a capital letter and does not end with a period
- [x] Changes are described above
- [x] All necessary steps are delivered (tests, docs, etc.)
EOF
)"
```

**Critical:** Only use `- [x]` (checked) boxes. Any `- [ ]` in the body will fail the DoD check. If you genuinely have open action items, describe them in prose instead of checkboxes.

## Step 8: After Opening — Required Manual Steps

These cannot be automated:

1. **Add an `area/` label** — required by contribution guidelines for changelog inclusion. Open the PR in the browser and add at least one `area/{capability}` label.
2. **Enable "Allow edits from maintainers"** — check this option on the PR page.

```bash
# Open PR in browser
gh pr view --repo kyma-project/busola --web
```

## Compliance Summary

Before submitting, verify:

- [ ] Title: `<type>: <Uppercase subject, no trailing period>`
- [ ] Body contains `Changes proposed in this pull request` section with real content
- [ ] Body contains `Related issue` section
- [ ] Zero unchecked `- [ ]` boxes anywhere in the body
- [ ] `npm run eslint-check` passes locally
- [ ] `npm run lint-check` passes locally
- [ ] PR is not in draft state (draft PRs skip lint but still appear as failing)
- [ ] `area/` label added after opening
- [ ] "Allow edits from maintainers" enabled
