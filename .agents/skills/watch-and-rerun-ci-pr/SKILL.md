---
name: watch-and-rerun-ci-pr
description: Watch a busola PR's CI checks and rerun flaky failures until the PR is green. Use when asked to "watch a PR", "rerun failing tests until green", "keep an eye on CI", or "get PR #N passing". Reruns only failures that match known flakiness patterns; a deterministic/real failure is reported and NOT looped on. Works off the PR's fetched state (via gh CLI or the GitHub MCP server) — no local checkout of the PR branch required.
---

# Watch PR CI and rerun flaky tests until green

Monitor the CI checks of a pull request on `kyma-project/busola`, and rerun failed jobs that are flaky until every check is green. This automates the "watch it and rerun the flakes" loop.

This skill operates entirely on the PR as it exists **on GitHub** — the HEAD SHA, its runs, and its diff are all fetched remotely. It does **not** assume the PR branch is checked out locally, and it works on cross-repository (fork) PRs the same way.

## When to use

Trigger keywords: "watch this PR", "rerun the failing tests till it's green", "keep watching CI", "get PR #N passing", "rerun until green".

## Prerequisites

At least **one** of the following must be available and authenticated to github.com:

- **`gh` CLI** — check with `gh auth status`. Provides everything, including reruns.
- **GitHub MCP server** (`github-tools` / `github-local`) — provides PR reads, check/run status, and diffs via `pull_request_read` (`get`, `get_diff`, `get_files`, `get_check_runs`, `get_status`), `search_pull_requests`, `list_commits`, etc.

**Capability note:** rerunning a workflow run currently requires the **`gh` CLI** (`gh run rerun`); the MCP servers can read PR/check state and diffs but have no rerun tool. So: if only the MCP server is available you can still _watch and classify_, but you cannot _rerun_ — surface that to the user and hand back the classification instead of looping. The commands below use `gh`; where a step is read-only, the MCP equivalent is noted so the skill degrades gracefully.

Plus: the PR number (repo is always `kyma-project/busola`).

## Running for several PRs at once

This skill is safe to run concurrently for different PRs — e.g. one Claude window per PR. Each window is an independent session with its own background tasks, so nothing is shared between them **except temp files on disk**. To avoid collisions, every temp path is scoped by PR number: `/tmp/pr_<PR>_settle.sh`, `/tmp/pr_<PR>_greenloop.sh`. Always substitute the real PR number so parallel instances never overwrite each other's script or output. Keep each window pinned to a single PR; don't drive two PRs from one window.

## Core principle: rerun flakes, not bugs

**A rerun only helps a flaky failure.** A deterministic failure — a real regression from the PR's own changes, a lint/title/description check, or a build error — will fail identically on every rerun and looping on it wastes hours. Before rerunning, classify each failure. Only rerun `flaky`/`infra` failures. Report `product-bug`/`test-bug`/lint/gate failures and stop.

For deep failure analysis, follow the `analyze-pr-tests` skill (`.agents/skills/analyze-pr-tests/SKILL.md`). Its classification table and flaky-pattern signals apply here directly.

### Known flaky signals (safe to rerun)

- `CypressError: ... cy.click() failed because the page updated ... element has detached from DOM`
- `CypressError: cy.type() failed because it targeted a disabled element` (element still loading)
- `AssertionError: Timed out retrying ... Expected to find content '...' but never did` (notification/async timing, on a spec unrelated to the PR's diff)
- Failures in a `before all` / `before each` hook of an integration spec
- The same spec is known to fail intermittently on `main`

### Real-failure signals (do NOT rerun — report instead)

- The failing assertion targets UI or behavior the PR intentionally changed (→ update the test in the PR, don't rerun)
- Backend / build / unit-test failures caused by the PR's code change (deterministic)
- `PR Title Check`, `Description Check`, `Definition of done Check`, `PR Lint Check` failures (fix the PR metadata/formatting, not a rerun)
- The same failure reproduces on a clean rerun with an identical error signature

## Step 1: Resolve the PR's current HEAD

```bash
SHA=$(gh pr view <PR> --repo kyma-project/busola --json headRefOid --jq .headRefOid)
gh pr view <PR> --repo kyma-project/busola \
  --json number,title,headRefName,state,isCrossRepository,headRepositoryOwner \
  --jq '{number,title,state,branch:.headRefName,fork:.isCrossRepository,owner:.headRepositoryOwner.login}'
```

_MCP equivalent:_ `pull_request_read` method `get` → read `head.sha`, `head.ref`, and cross-repo owner.

Always operate on the **latest** `SHA`. A new push supersedes older runs (which show as `cancelled`). If a new commit lands mid-watch, restart against the new `SHA`.

## Step 2: Fetch the PR's changed files (relatedness baseline)

To classify a failure as flaky-vs-real you must know **what the PR actually changed** — independent of any local branch. Fetch the changed-file list (and, if needed, the diff) straight from GitHub:

```bash
gh pr diff <PR> --repo kyma-project/busola --name-only          # changed file paths
# full diff when you need to inspect the change itself:
gh pr diff <PR> --repo kyma-project/busola | sed 's/\x1b\[[0-9;]*m//g' | head -300
```

_MCP equivalent:_ `pull_request_read` method `get_files` (paths + patch) or `get_diff` (unified diff).

Use this list as the relatedness test in Step 3: **does the failing spec/area overlap the changed files?**

- Failing test exercises code/paths the PR touched → lean **real** (a regression or a test that must be updated in the PR). Do not blindly rerun; inspect.
- Failing test is in an unrelated area and matches a flaky signal → lean **flaky** (safe to rerun).

This is what makes the skill work on fetched PR code: relatedness is judged from the GitHub diff, never from `git diff` in the working tree.

## Step 3: Wait for the current run set to settle, then classify

Runs are settled when none are `queued`/`in_progress`/`requested`/`waiting`/`pending`. Poll in the background (integration suites take ~20–35 min). Use `run_in_background: true` so the loop survives across turns and re-invokes you on exit.

```bash
cat > /tmp/pr_<PR>_settle.sh <<'SCRIPT'
REPO=kyma-project/busola
SHA=<SHA>
for i in $(seq 1 90); do
  sleep 60
  JSON=$(gh run list --repo "$REPO" --commit "$SHA" --limit 60 \
    --json databaseId,name,status,conclusion 2>/dev/null)
  ACTIVE=$(printf '%s' "$JSON" | grep -Eo '"status":"(queued|in_progress|requested|waiting|pending)"' | wc -l | tr -d ' ')
  echo "[poll $i @ $(date -u +%H:%M:%SZ)] active=$ACTIVE"
  if [ "$ACTIVE" = "0" ]; then
    echo "=== SETTLED ==="
    printf '%s' "$JSON" | python3 -c 'import sys,json
rows=json.load(sys.stdin)
latest={}
for r in rows:                       # keep only the latest run per name
    n=r["name"]
    if n not in latest or r["databaseId"]>latest[n]["databaseId"]:
        latest[n]=r
for r in sorted(latest.values(),key=lambda x:x["name"]):
    print((r["conclusion"] or r["status"])+"\t"+str(r["databaseId"])+"\t"+r["name"])'
    break
  fi
done
SCRIPT
bash /tmp/pr_<PR>_settle.sh
```

_MCP equivalent (read-only watch):_ poll `pull_request_read` method `get_check_runs` (or `get_status`) until no check is `in_progress`/`queued`.

For every run with conclusion `failure`, pull the failed-job log and inspect the error:

```bash
# Find the failed job id in a failed run
gh run view <RUN_ID> --repo kyma-project/busola --json jobs \
  --jq '.jobs[] | select(.conclusion=="failure") | {name, databaseId, startedAt, completedAt}'

# Read the failed-step log (strip ANSI, grep for the failure)
gh run view --repo kyma-project/busola --job <JOB_ID> --log-failed 2>/dev/null \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | grep -nE "passing|failing| [0-9]\) |AssertionError|CypressError|Timed out|detached|disabled element|Error:|exit code" \
  | head -60
```

Then decide, using the Step 2 changed-file list:

- **Runtime < 2 min with no test output** → `infra` (rerun).
- Matches a known flaky signal, on a spec **not** overlapping the PR diff → `flaky` (rerun).
- Matches a real-failure signal, or the failing area **overlaps** the PR diff → stop and report; do not rerun.

The aggregate **"All Checks passed"** gate failing while other checks are still red is expected — it re-evaluates. Do not classify it as a real failure; it gets rerun in Step 5 once the underlying checks are green.

## Step 4: Rerun flaky failures until green (capped loop)

Once you've confirmed the failures are flaky/infra, rerun the **entire failed run — all of its tests, not just the failed jobs** — and wait, repeating until success or an attempt cap (default 12; each cycle ~20–35 min). A full rerun re-executes every test in the suite, which gives a cleaner green signal than re-running only the one job that flaked. The one exception is the **"All Checks passed"** aggregate gate — never rerun it here; it is rerun exactly once in Step 5, after every other check is green. Encode the loop like this:

```bash
cat > /tmp/pr_<PR>_greenloop.sh <<'SCRIPT'
REPO=kyma-project/busola
RUN=<FAILED_RUN_ID>       # the flaky test run to drive green
SHA=<SHA>
MAX=12
attempt=0

wait_settle() { # $1 = run id; progress -> stderr; final "status conclusion" -> stdout
  local rid=$1 st
  for i in $(seq 1 90); do
    sleep 60
    st=$(gh run view "$rid" --repo "$REPO" --json status,conclusion --jq '.status+" "+.conclusion' 2>/dev/null)
    echo "  [wait $rid poll $i @ $(date -u +%H:%M:%SZ)] $st" >&2
    case "$st" in completed*) echo "$st"; return 0;; esac
  done
  echo "timeout"; return 1
}

while :; do
  st=$(wait_settle "$RUN")
  echo ">>> RUN settled: $st @ $(date -u +%H:%M:%SZ)"
  case "$st" in "completed success") echo ">>> GREEN"; break;; esac
  attempt=$((attempt+1))
  if [ "$attempt" -gt "$MAX" ]; then
    echo ">>> GAVE UP after $MAX reruns — still failing, needs a human look."
    exit 3
  fi
  echo ">>> rerun (all tests) attempt $attempt @ $(date -u +%H:%M:%SZ)"
  gh run rerun "$RUN" --repo "$REPO" 2>&1 | head -3
  sleep 30
done
SCRIPT
bash /tmp/pr_<PR>_greenloop.sh
```

If several distinct runs failed flakily, drive each to green with a full rerun (`gh run rerun <RUN_ID>` — no `--failed`, so all its tests re-run). You can extend the loop to track multiple run ids.

**If the loop exits with code 3 (cap hit):** stop rerunning. A failure surviving 12 reruns is almost certainly not flaky — re-read the latest failed log and reclassify; report to the user.

## Step 5: Rerun the aggregate gate, then confirm all-green

Once the underlying test runs are green, the **"All Checks passed"** run may still show its earlier `failure`. Rerun it (full rerun, not `--failed`) and wait:

```bash
gh run rerun <ALL_CHECKS_RUN_ID> --repo kyma-project/busola
```

Then take a final snapshot and confirm nothing is red:

```bash
gh run list --repo kyma-project/busola --commit <SHA> --limit 60 \
  --json name,status,conclusion \
  --jq '.[] | (.conclusion // .status) + "\t" + .name' | sort
```

## Step 6: Report

Summarize: which checks were green from the start, which failed and how they were classified (citing the PR-diff overlap when relevant), how many reruns each took, and the final all-green confirmation. If anything was reported as a real failure (not rerun), state it clearly with the error and the recommended fix.

## Guardrails

- Never rerun a deterministic/real failure or a metadata check (title/description/DoD/lint) — fix the PR instead.
- Judge relatedness from the PR's **fetched** diff (Step 2), not from the local working tree — the PR branch may not be checked out.
- Re-check the HEAD `SHA` if the watch runs long; a new push invalidates in-flight runs.
- If only the MCP server is available (no `gh`), you can watch and classify but not rerun — report that limitation rather than looping.
- Respect the attempt cap; escalate instead of looping forever.
- Reruns re-trigger CI compute — only rerun when the failure is genuinely flaky/infra.
