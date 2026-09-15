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

This skill is safe to run concurrently for different PRs — e.g. one Claude window per PR. Each window is an independent session with its own background tasks, so nothing is shared between them **except temp files on disk**. To avoid collisions, every temp path is scoped by PR number: `/tmp/mq_<PR>_settle.sh`, `/tmp/mq_<PR>_loop.sh`, `/tmp/mq_<PR>_settle.log`, `/tmp/mq_<PR>_loop.log`. Always substitute the real PR number so parallel instances never overwrite each other's scripts or logs. Keep each window pinned to a single PR; don't drive two PRs from one window.

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
  --json number,title,state,isInMergeQueue,headRefOid,mergeable,reviewDecision \
  --jq '{number,title,state,inMergeQueue:.isInMergeQueue,sha:.headRefOid,mergeable,reviewDecision}'
```

The PR must be `MERGEABLE` (no conflicts) and `reviewDecision` must not be `REVIEW_REQUIRED`. If `inMergeQueue` is already `true`, skip to Step 3.

## Step 2: Get the PR's changed files (relatedness baseline)

Fetch changed files now — needed later to classify flaky vs. real:

```bash
gh pr diff <PR> --repo kyma-project/busola --name-only
```

_MCP equivalent:_ `pull_request_read` method `get_files`.

A failing spec that overlaps the PR's changed files → lean **real** (inspect before re-queuing). A failing spec in an unrelated area matching a flaky signal → lean **flaky** (safe to re-queue).

## Step 3: Add PR to merge queue

```bash
gh pr merge <PR> --repo kyma-project/busola --squash --auto
```

This enables auto-merge (squash strategy), which adds the PR to the merge queue immediately when all requirements are met. Equivalent to clicking "Add to merge queue" in the GitHub UI.

Verify:

```bash
gh pr view <PR> --repo kyma-project/busola --json isInMergeQueue --jq .isInMergeQueue
# expect: true
```

## Step 4: Find the merge queue branch and its CI runs

GitHub creates a temporary branch named:

```
gh-readonly-queue/main/pr-<PR>-<MERGE_SHA>
```

Find it (uses the `matching-refs` endpoint — reliable even when there are many branches):

```bash
MQ_BRANCH=$(gh api "repos/kyma-project/busola/git/matching-refs/heads/gh-readonly-queue/main/pr-<PR>-" \
  --jq '.[0].ref | ltrimstr("refs/heads/") // empty' 2>/dev/null)
echo "MQ branch: $MQ_BRANCH"
```

If empty, the PR hasn't entered the queue yet — poll every 15 s until it appears (usually < 1 min after Step 3).

Once you have the branch, list its runs:

```bash
gh run list --repo kyma-project/busola --branch "$MQ_BRANCH" --limit 30 \
  --json databaseId,name,status,conclusion \
  --jq '.[] | (.conclusion // .status) + "\t" + (.databaseId | tostring) + "\t" + .name'
```

## Step 5: Wait for CI to settle, then classify

Poll until no run on the MQ branch is `queued`/`in_progress`/`requested`/`waiting`/`pending`. MQ integration suites take ~20–35 min.

```bash
cat > /tmp/mq_<PR>_settle.sh <<'SCRIPT'
REPO=kyma-project/busola
MQ_BRANCH="gh-readonly-queue/main/pr-<PR>-<MERGE_SHA>"
for i in $(seq 1 90); do
  sleep 60
  JSON=$(gh run list --repo "$REPO" --branch "$MQ_BRANCH" --limit 30 \
    --json databaseId,name,status,conclusion 2>/dev/null)
  ACTIVE=$(printf '%s' "$JSON" | grep -Eo '"status":"(queued|in_progress|requested|waiting|pending)"' | wc -l | tr -d ' ')
  echo "[poll $i @ $(date -u +%H:%M:%SZ)] active=$ACTIVE"
  if [ "$ACTIVE" = "0" ]; then
    echo "=== SETTLED ==="
    printf '%s' "$JSON" | python3 -c 'import sys,json
rows=json.load(sys.stdin)
latest={}
for r in rows:
    n=r["name"]
    if n not in latest or r["databaseId"]>latest[n]["databaseId"]:
        latest[n]=r
for r in sorted(latest.values(),key=lambda x:x["name"]):
    print((r["conclusion"] or r["status"])+"\t"+str(r["databaseId"])+"\t"+r["name"])'
    break
  fi
done
SCRIPT
bash /tmp/mq_<PR>_settle.sh > /tmp/mq_<PR>_settle.log 2>&1
# Use run_in_background: true — the settle loop takes 20-35 min and must survive across turns.
# Monitor output: tail -f /tmp/mq_<PR>_settle.log
```

After settling, check whether the PR was already merged (MQ branch disappears on success):

```bash
gh pr view <PR> --repo kyma-project/busola --json state,mergedAt --jq '{state,mergedAt}'
```

For each failed run, inspect the logs:

```bash
# Find the failed job in a run
gh run view <RUN_ID> --repo kyma-project/busola --json jobs \
  --jq '.jobs[] | select(.conclusion=="failure") | {name,databaseId}'

# Read the failure log
gh run view --repo kyma-project/busola --job <JOB_ID> --log-failed 2>/dev/null \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | grep -nE "passing|failing| [0-9]\) |AssertionError|CypressError|Timed out|detached|disabled element|Error:|exit code" \
  | head -60
```

## Step 6: Re-queue or stop (capped loop)

Once confirmed failures are flaky/infra, re-add to the queue and watch again. Default cap: **8 re-queues** (MQ runs are more expensive than plain reruns).

```bash
cat > /tmp/mq_<PR>_loop.sh <<'SCRIPT'
REPO=kyma-project/busola
PR=<PR>
MAX=8
attempt=0

is_merged() {
  gh pr view "$PR" --repo "$REPO" --json state --jq .state 2>/dev/null | grep -q "MERGED"
}

is_in_queue() {
  gh pr view "$PR" --repo "$REPO" --json isInMergeQueue --jq .isInMergeQueue 2>/dev/null | grep -q "true"
}

get_mq_branch() {
  gh api "repos/$REPO/git/matching-refs/heads/gh-readonly-queue/main/pr-${PR}-" \
    --jq '.[0].ref | ltrimstr("refs/heads/") // empty' 2>/dev/null
}

wait_settle() {  # polls until MQ branch runs settle; prints "success|failure|ejected"
  local branch="" st
  for j in $(seq 1 10); do
    branch=$(get_mq_branch)
    [ -n "$branch" ] && break
    sleep 15
  done
  if [ -z "$branch" ]; then
    is_merged && echo "merged" || echo "ejected"
    return
  fi
  for i in $(seq 1 90); do
    sleep 60
    JSON=$(gh run list --repo "$REPO" --branch "$branch" --limit 30 \
      --json databaseId,name,status,conclusion 2>/dev/null)
    ACTIVE=$(printf '%s' "$JSON" | grep -Eo '"status":"(queued|in_progress|requested|waiting|pending)"' | wc -l | tr -d ' ')
    echo "  [poll $i branch=$(basename "$branch") active=$ACTIVE @ $(date -u +%H:%M:%SZ)]" >&2
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
    echo ">>> GAVE UP after $MAX re-queues — still failing, needs a human look."
    exit 3
  fi
  echo ">>> re-queuing attempt $attempt @ $(date -u +%H:%M:%SZ)"
  gh pr merge "$PR" --repo "$REPO" --squash --auto 2>&1 | head -3
  sleep 30
}

while :; do
  if is_merged; then
    echo ">>> MERGED — done @ $(date -u +%H:%M:%SZ)"
    exit 0
  fi
  result=$(wait_settle)
  echo ">>> MQ settled: $result @ $(date -u +%H:%M:%SZ)"
  case "$result" in
    merged)  echo ">>> MERGED — done"; exit 0 ;;
    success) echo ">>> MQ green — polling for auto-merge..."; sleep 90 ;;
    ejected) echo ">>> PR ejected (no runs found). Re-queuing..."; requeue ;;
    failure) echo ">>> CI failed — inspect logs before re-queuing (see Step 5)."; requeue ;;
    timeout) echo ">>> Poll timed out — retrying loop."; ;;
  esac
done
SCRIPT
bash /tmp/mq_<PR>_loop.sh > /tmp/mq_<PR>_loop.log 2>&1
# Use run_in_background: true — the loop survives across turns and re-invokes you on exit.
# Monitor output: tail -f /tmp/mq_<PR>_loop.log
```

**IMPORTANT on `failure`:** The loop script re-queues automatically, but you must have already classified the failure as flaky/infra (Step 5) before running this loop. If you discover mid-loop that a failure is a real bug, **stop the script and report** — do not let it re-queue a deterministic failure.

**If the loop exits with code 3 (cap hit):** A failure surviving 8 re-queues is almost certainly not flaky. Re-read the latest failure log, reclassify, and report to the user.

## Step 7: Report

Summarize: which MQ entries passed, which were ejected and how classified (citing diff overlap), how many re-queues each took, and whether the PR was ultimately merged or stopped on a real failure. If anything was reported as a real failure, state the error and recommended fix.

## Guardrails

- **Never re-queue a deterministic failure** — fix the PR or test instead.
- **Classify before running the loop** — inspect Step 5 logs first; don't blindly start the loop script.
- **The PR must remain approved** — if reviewers request changes mid-watch, re-queuing won't work; resolve the review first.
- **Re-check HEAD SHA if the watch runs long** — a new push invalidates the current MQ entry; restart from Step 1.
- **If only MCP is available** — you can watch and classify but cannot re-queue (`gh pr merge` requires `gh`); report that limitation rather than looping.
- **Respect the attempt cap (8)** — escalate to the user instead of looping forever.
