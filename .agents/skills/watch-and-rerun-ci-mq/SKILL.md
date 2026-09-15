---
name: watch-and-rerun-ci-mq
description: Watch a busola PR's merge queue CI and automatically re-add to the queue on flaky failures until the PR is merged. Use when asked to "watch the merge queue", "keep the PR in the queue", "get PR #N merged via merge queue", "requeue until merged", or "PR keeps getting ejected from the queue". Re-queues only on flaky/infra failures; stops and reports deterministic failures.
---

# Watch Merge Queue CI and Re-queue on Flaky Failures

Monitor the CI checks of a PR's merge queue entry on `kyma-project/busola`, and re-add the PR to the merge queue when it is ejected due to flaky failures. This automates the "re-queue the flakes" loop until the PR is merged.

The merge queue creates a temporary branch for each entry. CI runs on that branch. If CI passes, the PR is auto-merged. If CI fails, the PR is **automatically ejected** — there is no "rerun" button. The only recovery is re-adding the PR to the queue.

## When to use

Trigger keywords: "watch the merge queue", "keep in merge queue", "requeue until merged", "PR keeps getting ejected", "MQ CI is flaky".

## Prerequisites

At least **one** of the following must be available:

- **`gh` CLI** authenticated to github.com (`gh auth status`). Required for re-queuing. Provides everything else too.
- **GitHub MCP server** (`github-tools`/`github-local`) — read-only; can watch and classify but cannot re-queue. If only MCP is available, report that limitation and hand back the classification.

The PR must be **approved** and all **required checks on the PR head itself must be green** before it can enter the merge queue. This skill assumes those conditions are already met.

Plus: the PR number (repo is always `kyma-project/busola`).

## Running for several PRs at once

This skill is safe to run concurrently for different PRs — e.g. one Claude window per PR. All temp paths are scoped by PR number: `/tmp/mq_<PR>_watch.sh`, `/tmp/mq_<PR>.log`. Keep each session pinned to one PR.

## Core principle: re-queue flakes, not bugs

A re-queue only helps a flaky failure. A deterministic failure reproduces identically every time. Before re-queuing, classify each ejection — only re-queue `flaky`/`infra` failures. Report `product-bug`/`test-bug`/lint/gate failures and stop.

For deep failure analysis, the classification table in `.agents/skills/analyze-pr-tests/SKILL.md` applies here directly.

### Known flaky signals (safe to re-queue)

- `CypressError: ... cy.click() failed because the page updated ... element has detached from DOM`
- `CypressError: cy.type() failed because it targeted a disabled element` (element still loading)
- `AssertionError: Timed out retrying ... Expected to find content '...'` in a spec unrelated to the PR diff
- Failures in `before all` / `before each` hooks of integration specs
- Runtime < 2 min with no test output (infra/provisioning failure)

### Real-failure signals (do NOT re-queue — report instead)

- The failing assertion targets UI or behavior the PR intentionally changed
- Build / unit-test / backend failures caused by the PR's code change
- The same failure reproduces on a clean re-queue with an identical error signature
- `PR Title Check`, `Description Check`, `Definition of done Check`, `PR Lint Check` (fix the PR metadata)

## Step 1: Verify PR state and HEAD SHA

```bash
gh pr view <PR> --repo kyma-project/busola \
  --json number,title,state,headRefOid,mergeable,reviewDecision \
  --jq '{number,title,state,sha:.headRefOid,mergeable,reviewDecision}'
```

The PR must be `MERGEABLE` (no conflicts) and `reviewDecision` must not be `REVIEW_REQUIRED`.

Check if already in the merge queue (the `isInMergeQueue` JSON field is unreliable — use the refs API):

```bash
gh api "repos/kyma-project/busola/git/matching-refs/heads/gh-readonly-queue/main/pr-<PR>-" \
  --jq '.[0].ref | ltrimstr("refs/heads/") // "not in queue"' 2>/dev/null
```

If a branch is returned, the PR is already queued — skip to Step 3.

## Step 2: Get the PR's changed files (relatedness baseline)

Fetch changed files now — needed later to classify flaky vs. real:

```bash
gh pr diff <PR> --repo kyma-project/busola --name-only
```

_MCP equivalent:_ `pull_request_read` method `get_files`.

A failing spec that overlaps the PR's changed files → lean **real** (inspect before re-queuing). A failing spec in an unrelated area matching a flaky signal → lean **flaky** (safe to re-queue).

## Step 3: Add PR to merge queue

**IMPORTANT:** For repos with a merge queue protection rule, use **no strategy flags**. Adding `--squash`, `--merge`, `--rebase`, or `--auto` either errors or silently does nothing.

```bash
gh pr merge <PR> --repo kyma-project/busola
```

> From `gh pr merge --help`: _"When targeting a branch that requires a merge queue, no merge strategy is required. If required checks have passed, the pull request will be added to the merge queue."_

Verify using the refs API (not `--json isInMergeQueue`, which is unreliable):

```bash
gh api "repos/kyma-project/busola/git/matching-refs/heads/gh-readonly-queue/main/pr-<PR>-" \
  --jq '.[0].ref | ltrimstr("refs/heads/") // "not in queue"' 2>/dev/null
# expect: gh-readonly-queue/main/pr-<PR>-<SHA>
```

## Step 4: Inspect the first failure, then start the automated watch loop

Once the PR is in the queue, CI takes ~20–35 min. For the **first failure only**, inspect the logs manually to confirm the failure is flaky before starting the automated loop:

```bash
# List runs on the MQ branch
MQ_BRANCH=$(gh api "repos/kyma-project/busola/git/matching-refs/heads/gh-readonly-queue/main/pr-<PR>-" \
  --jq '.[0].ref | ltrimstr("refs/heads/")' 2>/dev/null)

gh run list --repo kyma-project/busola --branch "$MQ_BRANCH" --limit 30 \
  --json databaseId,name,status,conclusion \
  --jq '.[] | (.conclusion // .status) + "\t" + (.databaseId | tostring) + "\t" + .name'

# Find failed jobs
gh run view <RUN_ID> --repo kyma-project/busola --json jobs \
  --jq '.jobs[] | select(.conclusion=="failure") | {name,databaseId}'

# Read failure log
gh run view --repo kyma-project/busola --job <JOB_ID> --log-failed 2>/dev/null \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | grep -nE "passing|failing| [0-9]\) |AssertionError|CypressError|Timed out|detached|disabled element|Error:|exit code" \
  | head -60
```

Once confirmed flaky, start the automated watch loop in Step 5.

## Step 5: Run the automated watch loop

Write and launch the watch script. It polls CI, re-queues on flaky/ejected outcomes, and exits when the PR is merged or the cap is hit.

**Critical implementation notes — bugs that silently break the loop:**

1. **`log()` must write only to the log file, never to stdout.** The loop uses `result=$(wait_settle)` to capture the function's return value. Any `echo` or `log()` call inside `wait_settle()` that writes to stdout will corrupt `$result`, causing the `case` statement to never match and re-queuing to never happen. All diagnostic output inside `wait_settle()` must go to the file directly or use `>&2`.

2. **No strategy flags on `gh pr merge`.** `--squash`, `--auto`, `--merge`, or `--rebase` silently fail or emit a warning without queuing for merge-queue repos. Use `gh pr merge "$PR" --repo "$REPO"` with no other flags.

```bash
cat > /tmp/mq_<PR>_watch.sh <<'SCRIPT'
#!/bin/bash
REPO=kyma-project/busola
PR=<PR>
LOG=/tmp/mq_<PR>.log
MAX=8
attempt=0

# CRITICAL: log() writes only to file — never to stdout.
# wait_settle() is called in a subshell: result=$(wait_settle)
# Any stdout from log() would corrupt $result and break the case statement.
log() { echo "[$(date -u +%H:%M:%SZ)] $*" >> "$LOG"; }

is_merged() {
  gh pr view "$PR" --repo "$REPO" --json state --jq .state 2>/dev/null | grep -q "MERGED"
}

get_mq_branch() {
  gh api "repos/$REPO/git/matching-refs/heads/gh-readonly-queue/main/pr-${PR}-" \
    --jq '.[0].ref | ltrimstr("refs/heads/") // empty' 2>/dev/null
}

wait_settle() {
  # Only echo the status word to stdout. All other output goes to log file directly.
  local branch=""
  for j in $(seq 1 10); do
    branch=$(get_mq_branch)
    [ -n "$branch" ] && break
    log "  waiting for MQ branch (try $j)..."
    sleep 15
  done
  if [ -z "$branch" ]; then
    is_merged && echo "merged" || echo "ejected"
    return
  fi
  log "  MQ branch: $branch"
  for i in $(seq 1 90); do
    sleep 60
    JSON=$(gh run list --repo "$REPO" --branch "$branch" --limit 30 \
      --json databaseId,name,status,conclusion 2>/dev/null)
    ACTIVE=$(printf '%s' "$JSON" | grep -Eo '"status":"(queued|in_progress|requested|waiting|pending)"' | wc -l | tr -d ' ')
    log "  poll $i active=$ACTIVE"
    if [ "$ACTIVE" = "0" ]; then
      FAIL=$(printf '%s' "$JSON" | grep -c '"conclusion":"failure"' || true)
      [ "$FAIL" = "0" ] && echo "success" || echo "failure"
      return
    fi
  done
  echo "timeout"
}

requeue() {
  attempt=$((attempt+1))
  if [ "$attempt" -gt "$MAX" ]; then
    log "GAVE UP after $MAX re-queues — needs a human look."
    exit 3
  fi
  log "re-queuing attempt $attempt..."
  # No strategy flags — required for merge-queue repos
  out=$(gh pr merge "$PR" --repo "$REPO" 2>&1)
  log "  gh output: $out"
  sleep 15
  # Confirm the branch appeared
  local branch
  for j in $(seq 1 8); do
    branch=$(get_mq_branch)
    [ -n "$branch" ] && { log "  confirmed in queue: $branch"; return; }
    log "  not in queue yet (try $j)..."
    sleep 10
  done
  log "  WARNING: could not confirm queue entry after re-queue"
}

log "=== Watch started (PR=$PR, MAX=$MAX) ==="

while :; do
  if is_merged; then
    log "MERGED — done!"
    exit 0
  fi
  result=$(wait_settle)
  log "MQ settled: $result"
  case "$result" in
    merged)  log "MERGED — done!"; exit 0 ;;
    success) log "MQ green — waiting for auto-merge..."; sleep 90 ;;
    ejected) log "PR ejected. Re-queuing..."; requeue ;;
    failure) log "CI failed (flaky). Re-queuing..."; requeue ;;
    timeout) log "Poll timed out — retrying." ;;
  esac
done
SCRIPT
chmod +x /tmp/mq_<PR>_watch.sh
```

Launch as a detached background process:

```bash
> /tmp/mq_<PR>.log
bash /tmp/mq_<PR>_watch.sh &
echo "PID: $!"
```

Monitor progress:

```bash
tail -f /tmp/mq_<PR>.log
# or spot-check:
tail -20 /tmp/mq_<PR>.log
pgrep -f mq_<PR>_watch.sh && echo running || echo DEAD
```

If the script dies unexpectedly, restart it — it will pick up the current queue state automatically.

**IMPORTANT on `failure`:** The loop re-queues automatically, but you must have already confirmed the first failure is flaky (Step 4) before starting. If a failure mid-loop looks like a real bug (same error, overlaps PR diff), **kill the script and report** — do not let it re-queue a deterministic failure.

**If the loop exits with code 3 (cap hit):** A failure surviving 8 re-queues is almost certainly not flaky. Re-read the latest failure log, reclassify, and report to the user.

## Step 6: Report

Summarize: which MQ entries passed, which were ejected and how classified (citing diff overlap), how many re-queues each took, and whether the PR was ultimately merged or stopped on a real failure. If anything was reported as a real failure, state the error and recommended fix.

## Guardrails

- **Never re-queue a deterministic failure** — fix the PR or test instead.
- **Classify the first failure before starting the loop** — inspect Step 4 logs; don't blindly start the script.
- **The PR must remain approved** — if reviewers request changes mid-watch, re-queuing won't work; resolve the review first.
- **Re-check HEAD SHA if the watch runs long** — a new push invalidates the current MQ entry; restart from Step 1.
- **If only MCP is available** — you can watch and classify but cannot re-queue (`gh pr merge` requires `gh`); report that limitation rather than looping.
- **Respect the attempt cap (8)** — escalate to the user instead of looping forever.
