---
name: watch-and-rerun-ci-release
description: Watch a busola release workflow run's CI and rerun flaky failures until the release run is green. Use when asked to "watch a release", "watch this release run", "rerun the failing release test until green", or given a GitHub Actions run URL/ID for the "Create release" workflow. By default reruns ONLY the failed jobs (gh run rerun --failed), matching "rerun only the failing test". Reruns only failures that match known flakiness patterns; a deterministic/real failure is reported and NOT looped on. Works off the run's fetched state (via gh CLI or the GitHub MCP server) — no local checkout required.
---

# Watch release CI and rerun flaky tests until green

Monitor the CI of a **release workflow run** on `kyma-project/busola` (the "Create release" workflow, triggered via `workflow_dispatch`), and rerun failed jobs that are flaky until the run is green. This is the release analogue of `watch-and-rerun-ci-pr`.

Unlike a PR, a release run is built from a tag / `main` — there is **no PR diff** to judge relatedness against. Classification is therefore based on known-flaky signals and whether the failure reproduces deterministically across reruns, not on changed-file overlap.

This skill operates entirely on the run as it exists **on GitHub** — the run id, its jobs, and their logs are fetched remotely. It does **not** assume anything is checked out locally.

## When to use

Trigger keywords: "watch this release", "watch the release run", "rerun the failing release test until green", "get the release run green", plus a GitHub Actions run URL (`.../actions/runs/<RUN_ID>`) or run id for the "Create release" workflow.

## Key difference from the PR skill: rerun only the failed jobs

For a **release** run the default is `gh run rerun <RUN_ID> --failed` — rerun **only the failed jobs**, not the whole run. This is deliberate:

- It matches the common ask ("rerun **only** the failing test").
- The release artifact/tag/image is usually already published by earlier jobs in the same run; the failing job is typically just an integration **gate**. Re-running only the failed job re-evaluates the gate without re-triggering publish steps.

Use a full rerun (`gh run rerun <RUN_ID>` with no `--failed`) only if the user explicitly asks to re-run the entire release pipeline.

## Prerequisites

At least **one** of the following, authenticated to github.com:

- **`gh` CLI** — check with `gh auth status`. Provides everything, including reruns.
- **GitHub MCP server** (`github-tools` / `github-local`) — read-only run/job/log access; **no rerun tool**.

**Capability note:** rerunning requires the **`gh` CLI** (`gh run rerun`). With only the MCP server you can _watch and classify_ but not _rerun_ — surface that and hand back the classification.

Plus: the release run id or its URL (repo is always `kyma-project/busola`).

## Running for several releases at once

Safe to run concurrently for different runs. Every temp path is scoped by run id: `/tmp/release_<RUN_ID>_settle.sh`, `/tmp/release_<RUN_ID>_greenloop.sh`. Always substitute the real run id so parallel instances never collide. Keep each window pinned to a single run.

## Core principle: rerun flakes, not bugs

**A rerun only helps a flaky failure.** A deterministic failure — a real regression on `main`/the release tag, a build error, a lint/type check — fails identically on every rerun; looping wastes hours. Classify each failure first. Only rerun `flaky`/`infra` failures. Report `product-bug`/`build`/`lint`/gate failures and stop.

For deep failure analysis, follow the `analyze-pr-tests` skill (`.agents/skills/analyze-pr-tests/SKILL.md`). Its classification table and flaky-pattern signals apply here directly.

### Known flaky signals (safe to rerun)

- `CypressError: ... cy.click() failed because the page updated ... element has detached from DOM`
- `CypressError: cy.type() failed because it targeted a disabled element` (element still loading)
- `AssertionError: Timed out retrying after Nms: Expected to find content/element '...' but never did / never found it` (async/notification timing)
- Failures in a `before all` / `before each` hook of an integration spec
- The same spec is known to fail intermittently on `main`
- Runtime < 2 min with no test output, or a runner/infra error (checkout, k3d, Kyma setup) → `infra`

### Real-failure signals (do NOT rerun — report instead)

- Backend / build / unit-test / type-check failures (deterministic; a real break on the release ref)
- The same failure reproduces on a clean rerun with an identical error signature
- `Validate release name` or any release-gating metadata check failing

## Step 1: Resolve the run id

From a URL like `https://github.com/kyma-project/busola/actions/runs/35828892033`, the run id is the trailing number.

```bash
RUN=<RUN_ID>
gh run view "$RUN" --repo kyma-project/busola \
  --json name,event,workflowName,headBranch,status,conclusion,createdAt \
  --jq '{name,event,workflowName,branch:.headBranch,status,conclusion,createdAt}'
```

Confirm `workflowName` is `Create release` and `event` is `workflow_dispatch`. A release run is a **single run with many jobs** (build, integration, smoke, lint, etc.), not one-run-per-check like a PR.

_MCP equivalent:_ no direct run-by-id read tool; use `gh` here, or the Actions REST API if wired.

## Step 2: Identify the failed job(s)

```bash
gh run view "$RUN" --repo kyma-project/busola --json jobs \
  --jq '.jobs[] | select(.conclusion=="failure") | {name, id: .databaseId, startedAt, completedAt}'
```

Note each failed job's name and id. For the release integration gate this is typically `kyma-integration-test-dev / run-integration-test`.

## Step 3: Read the failed-job log and classify

```bash
gh run view --repo kyma-project/busola --job <JOB_ID> --log-failed 2>/dev/null \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | grep -nE "passing|failing| [0-9]+\) |AssertionError|CypressError|Timed out|detached|disabled element|Error:|exit code" \
  | grep -viE "workflow telemetry|getLineGraph|AxiosError" \
  | head -80
```

**Ignore telemetry noise.** The `gardenlinux/workflow-telemetry-action` emits `AxiosError: Request failed with status code 403` / `[Workflow Telemetry] ...` annotations that are unrelated to the test result — filter them out (the `grep -vi` above) and read the actual Cypress `N failing` block.

Then classify each failing spec:

- Matches a known flaky signal (async timeout, detached DOM, disabled element, hook failure) → `flaky` (rerun).
- Runtime < 2 min / runner-infra error → `infra` (rerun).
- Build/type/unit failure, or reproduces deterministically with the same signature → **stop and report**; do not rerun.

Because there is no PR diff, do **not** try to judge changed-file overlap. Relatedness for a release = "is this a known-flaky spec / does it match a flaky signature", plus the reproduce-across-reruns test in Step 4.

## Step 4: Rerun only the failed jobs until green (capped loop)

Once the failures are classified flaky/infra, rerun **only the failed jobs** and wait, repeating until success or an attempt cap (default 8; each integration cycle ~20–30 min).

```bash
cat > /tmp/release_<RUN_ID>_greenloop.sh <<'SCRIPT'
REPO=kyma-project/busola
RUN=<RUN_ID>
MAX=8
attempt=0

wait_settle() { # progress -> stderr; final "status conclusion" -> stdout
  local st
  for i in $(seq 1 90); do
    sleep 60
    st=$(gh run view "$RUN" --repo "$REPO" --json status,conclusion --jq '.status+" "+.conclusion' 2>/dev/null)
    echo "  [wait $RUN poll $i @ $(date -u +%H:%M:%SZ)] $st" >&2
    case "$st" in completed*) echo "$st"; return 0;; esac
  done
  echo "timeout"; return 1
}

while :; do
  st=$(wait_settle)
  echo ">>> RUN settled: $st @ $(date -u +%H:%M:%SZ)"
  case "$st" in "completed success") echo ">>> GREEN"; break;; esac
  attempt=$((attempt+1))
  if [ "$attempt" -gt "$MAX" ]; then
    echo ">>> GAVE UP after $MAX reruns — still failing, needs a human look."
    exit 3
  fi
  echo ">>> rerun --failed attempt $attempt @ $(date -u +%H:%M:%SZ)"
  gh run rerun "$RUN" --repo "$REPO" --failed 2>&1 | head -3
  sleep 30
done
SCRIPT
bash /tmp/release_<RUN_ID>_greenloop.sh
```

Run it with `run_in_background: true` so the loop survives across turns and re-invokes you on exit.

**Re-classify before each rerun if the signature changes.** If a rerun surfaces a _different, deterministic_ failure, stop and report — that's a real break, not a flake.

**If the loop exits with code 3 (cap hit):** stop rerunning. A failure surviving the cap is almost certainly not flaky — re-read the latest failed log, reclassify, and report to the user.

## Step 5: Confirm all-green and report

```bash
gh run view <RUN_ID> --repo kyma-project/busola --json status,conclusion,jobs \
  --jq '{status,conclusion} , (.jobs[] | {name, conclusion})'
```

Summarize: the release run and version, which jobs were green from the start, which job(s) failed and how each failing spec was classified (with the flaky signature quoted), how many `--failed` reruns it took, and the final all-green confirmation. If anything was reported as a real failure (not rerun), state it clearly with the error and the recommended fix.

Note whether the release artifact/tag/image was already published by earlier jobs before the gate flaked — reruns re-evaluate the gate, they do not republish.

## Guardrails

- Default to `gh run rerun <RUN_ID> --failed` (only the failed jobs). Full-pipeline rerun only on explicit request.
- Never rerun a deterministic/real failure, a build/type/unit failure, or a release-metadata gate — report it instead.
- No PR diff exists for a release; judge relatedness by flaky-signature + reproduce-across-reruns, never by a local `git diff`.
- Filter out `workflow-telemetry` `AxiosError`/`getLineGraph` annotations — they are not the test result.
- Respect the attempt cap; escalate instead of looping forever.
- Reruns re-trigger CI compute — only rerun when the failure is genuinely flaky/infra.
