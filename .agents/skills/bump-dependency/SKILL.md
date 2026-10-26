---
name: bump-dependency
description: Safely bump a single npm dependency. Fetches the changelog for breaking changes, scans the codebase for affected call sites, optionally applies fixes, then runs lint/typecheck. Trigger keywords — "bump dependency", "update package", "upgrade package", "bump npm", "update npm".
---

# Bump Dependency Safely

Bump one npm dependency safely by checking its changelog for breaking changes,
cross-referencing them against the codebase, and offering to apply any required
code changes before running verification.

## Inputs

Parse from `$ARGUMENTS` (space-separated) or conversation context:

| Argument    | Required | Default  | Values                     |
| ----------- | -------- | -------- | -------------------------- |
| `package`   | Yes      | —        | any npm package name       |
| `version`   | No       | `latest` | semver string or `latest`  |
| `workspace` | No       | `root`   | `root`, `backend`, `tests` |

If `package` is missing, ask the user before continuing.

If `workspace` is not provided, default to `root` and tell the user:

> "No workspace specified — using `root` (`package.json` / `src/`)."

**Workspace mapping:**

| Workspace | `package.json`                   | Source dir           | Lint/typecheck                              | Test command                |
| --------- | -------------------------------- | -------------------- | ------------------------------------------- | --------------------------- |
| `root`    | `package.json`                   | `src/`               | `npm run eslint-check && npm run typecheck` | `npm test`                  |
| `backend` | `backend/package.json`           | `backend/`           | (none — skip, note to user)                 | `cd backend && npm test`    |
| `tests`   | `tests/integration/package.json` | `tests/integration/` | (none — skip, note to user)                 | ask user which suite to run |

---

## Step 1 — Resolve versions

1. Read the current version from the workspace's `package.json`:

   ```bash
   node -e "const p=require('./<workspace-path>/package.json'); console.log(p.dependencies?.['<package>'] ?? p.devDependencies?.['<package>'] ?? 'not found')"
   ```

   For `root` use `.` as the workspace path, for `backend` use `backend`, for `tests` use `tests/integration`.

   Strip any leading `^`, `~`, or `>=` from the value to get the installed semver string.
   If the package is not in that `package.json`, tell the user and stop.

2. If target version is `latest` or omitted, resolve it:

   ```bash
   npm view <package> version
   ```

3. If `current === target`, stop:
   > "Already on `<package>@<version>`. Nothing to do."

---

## Step 2 — Fetch the changelog

Try sources in this order, stopping as soon as one yields usable content:

### Source A — GitHub Releases (preferred)

```bash
npm view <package> repository.url
```

If the URL contains `github.com`, extract `<owner>/<repo>` from it (strip `.git` suffix, strip `git+https://github.com/` prefix).

```bash
gh api repos/<owner>/<repo>/releases --jq '[.[] | {tag: .tag_name, body: .body}]'
```

Filter to releases whose tag falls between the current and target versions (inclusive of target, exclusive of current). A tag matches a version if it equals `v<version>` or `<version>`.

### Source B — CHANGELOG.md at target tag

If no GitHub URL was found in Source A, skip Source B and proceed to Source C.

If GitHub Releases are empty or every release body is blank:

```
WebFetch https://raw.githubusercontent.com/<owner>/<repo>/v<target-version>/CHANGELOG.md
```

If `v<target-version>` 404s, try `<target-version>` (without the `v`).

Parse the markdown: find the heading that matches the target version and collect all content down to the next version heading. Repeat for any intermediate versions between current and target.

### Source C — npm page (last resort)

```
WebFetch https://www.npmjs.com/package/<package>?activeTab=versions
```

Scan for release notes or changelog links.

### Failure

If all three sources fail or return no content:

> "No changelog found for `<package>` — cannot assess breaking changes automatically. Proceed with caution."

Stop. Do not attempt a bump.

---

## Step 3 — Breaking-change gate

Scan the fetched changelog text for breaking change indicators:

- Section headings or list items containing `BREAKING CHANGE`, `breaking change`, `⚠️`, or `BREAKING`
- A major semver bump (e.g. `4.x → 5.x`) — treat any major version increase as a signal to look harder even if not explicitly labelled

### Short-circuit path — no breaking changes

Show a brief summary of what changed (one line of features/fixes), then ask:

> "No breaking changes found. Apply the bump?
> (`npm install <package>@<version>` in `<workspace-dir>/`)"

If yes → jump to **Step 4**.
If no → stop.

### Deep-analysis path — breaking changes found

1. List each breaking change extracted from the changelog with its description.

2. Scan the workspace source directory for usage of the package:

   ```bash
   grep -rn "from ['\"]<package>['\"]" <source-dir>/
   grep -rn "require(['\"]<package>['\"]" <source-dir>/
   ```

   Also search for specific API names, option names, or method names mentioned in each breaking change:

   ```bash
   grep -rn "<symbol-from-breaking-change>" <source-dir>/
   ```

3. Cross-reference: for each breaking change, list the files and line numbers that use the affected API.

4. Present the impact table:

```
## Breaking changes in <package> <current> → <target>

### <Breaking change title>
<One-sentence description from the changelog>

**Affected in this codebase:**
| File | Line | Change required |
|------|------|-----------------|
| src/path/to/file.ts | 42 | <what needs to change> |

_(No files affected)_  ← use this row when grep finds no matches
```

5. Ask:

   > "Want me to apply these changes?"
   - **Yes** → apply the edits described in the table, then proceed to **Step 4**.
   - **No** → re-present the table as a markdown checklist the user can work through manually:
     ```
     - [ ] `src/path/to/file.ts:42` — <change required>
     ```
     Then ask:
     > "Apply the version bump anyway (without code changes)?"
     - Yes → proceed to **Step 4**.
     - No → stop.

---

## Step 4 — Apply the bump and verify

### 4a. Install

Run in the workspace directory:

```bash
# root
npm install <package>@<version>

# backend
cd backend && npm install <package>@<version>

# tests
cd tests/integration && npm install <package>@<version>
```

### 4b. Lint and typecheck (automatic — no prompt)

| Workspace | What to run                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `root`    | `npm run eslint-check` then `npm run typecheck`                                                         |
| `backend` | Skip — no lint/typecheck scripts in backend. Note: "Backend is JavaScript — no type check available."   |
| `tests`   | Skip — no lint/typecheck scripts in tests. Note: "No lint/typecheck available for the tests workspace." |

If lint or type errors appear: report them and note "Needs manual attention — lint/type errors are out of scope for this skill." Do **not** attempt to auto-fix them.

### 4c. Test offer

Ask (adjust wording based on workspace):

- For `root` workspace: "Lint and type checks passed. Want me to run the test suite?"
- For `backend` and `tests` workspaces: "Ready. Want me to run the test suite?"

Run the test command for the workspace (see the table in the Inputs section).

For `tests` workspace: ask which suite — `test:cluster`, `test:namespace`, `test:kyma-e2e`, or `test:accesibility`.

Report pass/fail output. If no: end with a summary of what was bumped and what code changes were applied.
