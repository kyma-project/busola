# Skill: Analyze Cypress Integration Test Failures

Analyze Cypress integration test failures for a given GitHub PR in the busola repository.

## Usage

The user provides a PR number or URL. You will fetch CI run details via the GitHub MCP server, identify failed Cypress jobs, inspect logs and annotations, and produce a structured failure report.

**Important:** Use GitHub MCP server tools or the `gh` CLI for GitHub API interactions — prefer whichever is more convenient for the task. When scripting is needed (e.g., parsing logs, processing JSON, filtering data), prefer writing and running Node.js scripts via the Bash tool (`node -e '...'` or a temporary `.js` file) over shell pipelines or Python.

## Steps

### 1. Identify the PR

Extract the PR number from the user's input. The repo is `kyma-project/busola`.

Use the GitHub MCP tool to get the PR details including title, head branch, and status checks.

### 2. Find failed Cypress CI checks

Only analyze the **latest** check run for each workflow (i.e. the check run associated with the current HEAD commit of the PR). Do not look at or report on failures from earlier commits.

From the check runs, filter for checks with conclusion `failure` or `timed_out` that correspond to Cypress workflows. The relevant workflow/job names are:

- `run-namespace-test` → namespace tests (`tests/namespace/*.spec.js`)
- `run-cluster-test` → cluster + extensibility + companion tests (`tests/cluster/*.spec.js`, `tests/extensibility/*.spec.js`, `tests/companion/*.spec.js`)
- `run-smoke-test-stage` → smoke tests
- `run-unit-and-component-test` → unit + component tests (Cypress component tests)
- `run-accessibility-tests` → accessibility tests
- `run-integration-test` → Kyma e2e tests (`tests/kyma*/*.spec.js`)

### 2a. Get failed jobs for each workflow run

Once you have the workflow run IDs from Step 2, enumerate their failed jobs — these are the concrete starting points for log analysis.

**List all jobs and filter to failed ones:**

```bash
gh api repos/kyma-project/busola/actions/runs/<RUN_ID>/jobs | \
  node -e "
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
const failed = data.jobs.filter(j => j.conclusion === 'failure' || j.conclusion === 'timed_out');
failed.forEach(j => {
  console.log('job_id:', j.id);
  console.log('name:  ', j.name);
  console.log('status:', j.conclusion);
  console.log('url:   ', j.html_url);
  const failedSteps = j.steps.filter(s => s.conclusion === 'failure' || s.conclusion === 'timed_out');
  failedSteps.forEach(s => console.log('  failed step:', s.number, s.name));
  console.log();
});
"
```

This gives you each failed **job ID** and the specific **step** that failed within it. Use these as direct inputs to the log commands in Step 3a — scoping to a job ID makes log retrieval much faster and avoids downloading irrelevant output.

**Quick one-liner to extract just job IDs and names:**

```bash
gh api repos/kyma-project/busola/actions/runs/<RUN_ID>/jobs \
  --jq '.jobs[] | select(.conclusion=="failure" or .conclusion=="timed_out") | "\(.id) \(.name)"'
```

**Key fields to capture for each failed job:**

| Field                                         | How to use                                                                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `job.id`                                      | Pass to `--job <JOB_ID>` in `gh run view --log-failed`                                                                                  |
| `job.name`                                    | Maps to the Cypress workflow (e.g. `run-namespace-test`)                                                                                |
| `job.steps[].name` where `conclusion=failure` | Pinpoints whether Cypress itself failed or a setup step (checkout, install, cluster provisioning) failed — the latter indicates `infra` |
| `job.started_at` / `job.completed_at`         | Compute runtime; < 2 min with no Cypress output → `infra`                                                                               |

**Distinguishing Cypress failure from infra failure by step name:**

- Steps named `Run Cypress tests`, `cypress run`, or similar → Cypress ran → proceed to log parsing
- Steps named `Checkout`, `Setup Node`, `Install dependencies`, `Provision cluster`, `Wait for cluster` → infra failure before Cypress → classify as `infra` immediately

### 3. Fetch workflow run logs

For each failed check, extract the workflow run ID from the check's `details_url` (format: `https://github.com/kyma-project/busola/actions/runs/<RUN_ID>/job/<JOB_ID>`).

Use the GitHub MCP tool to:

- Get the workflow run details (status, conclusion, timing)
- List jobs for the run and get failed job details
- Download or view the run logs to find Cypress failure output
- List available artifacts for the run

### 3a. How to retrieve logs

Use the following approaches in order of preference:

**Option A — `gh run view --log-failed` (fastest):**

```bash
# Get only failed-step logs for a run
gh run view <RUN_ID> --log-failed -R kyma-project/busola

# Scope to a specific job
gh run view <RUN_ID> --log-failed --job <JOB_ID> -R kyma-project/busola
```

This emits only the output of failed steps, which is usually sufficient for Cypress failures.

**Option B — `gh run view --log` (full output):**

```bash
gh run view <RUN_ID> --log --job <JOB_ID> -R kyma-project/busola
```

Use when `--log-failed` is empty or truncated (e.g. the failure happened in a passing step that caused a later step to fail).

**Option C — Download artifacts (screenshots, videos, mochawesome reports):**

```bash
# List available artifacts for a run
gh api repos/kyma-project/busola/actions/runs/<RUN_ID>/artifacts | \
  node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); \
    JSON.parse(d).artifacts.forEach(a=>console.log(a.id, a.name, a.size_in_bytes))"

# Download a specific artifact by name (e.g. cypress screenshots)
gh run download <RUN_ID> -n <ARTIFACT_NAME> -D /tmp/cypress-artifacts -R kyma-project/busola
```

Cypress uploads screenshots on failure (`cypress/screenshots/`) and mochawesome JSON reports. These give the exact failing assertion and a screenshot. Prefer them when log output is truncated.

**Option D — GitHub MCP server tools:**
Use `get_workflow_run_logs` or equivalent MCP tool when available — it returns the same content as Option A/B without requiring a shell call.

**Extracting the RUN_ID:**
The `details_url` on a check run has the format:
`https://github.com/kyma-project/busola/actions/runs/<RUN_ID>/job/<JOB_ID>`

Parse it with:

```bash
echo "https://github.com/kyma-project/busola/actions/runs/12345678/job/87654321" | \
  node -e "const u=require('fs').readFileSync('/dev/stdin','utf8').trim(); \
    const m=u.match(/runs\/(\d+)\/job\/(\d+)/); console.log('run:',m[1],'job:',m[2])"
```

**Analyzing large log output:**
When log content is long, pipe it through Node.js to extract only Cypress-relevant lines:

```bash
gh run view <RUN_ID> --log-failed -R kyma-project/busola | \
  node -e "
const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\n');
const relevant = lines.filter(l =>
  /AssertionError|CypressError|Timed out|✗|×|passing|failing|Error:|after each|before each/.test(l)
);
console.log(relevant.join('\n'));
"
```

### 4. Parse failure details from logs

In the log output, look for:

- `AssertionError` — assertion mismatches (expected vs actual values)
- `CypressError` — timeouts, element not found, network failures
- `Error: Timed out` — step/hook timeouts
- Lines starting with `✗` or `×` — failed test names
- `after each` / `before each` hook failures — setup/teardown issues
- Cypress exit code 10 — means tests ran and some failed
- "No files were found with the provided path" — means Cypress never ran (infra failure)

Also examine check run annotations for additional context.

Extract for each failure:

- Spec file name (e.g. `tests/companion/test-companion-ui.spec.js`)
- Test title (full `describe` + `it` path)
- Error type and message
- Line number if available

### 5. Correlate failures with source files

For each failing spec, read the test file in the repo to understand what the test is asserting and what Kubernetes resource or UI flow it covers.

### 6. Check recent main branch runs for flakiness

To determine if a failure is flaky vs. a regression introduced by the PR, use the GitHub MCP tool to list recent workflow runs on `main` for the same workflow:

- Get the last 5 runs on `main`
- Check if the same tests failed there recently

### 7. Classify each failure

Assign one of these categories:

| Category      | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `flaky`       | Test is known to be intermittent; failure is likely not caused by this PR                                      |
| `product-bug` | Failure points to a real regression in the application under test                                              |
| `test-bug`    | The test itself has a bug (wrong selector, hardcoded timing, stale fixture)                                    |
| `infra`       | CI infrastructure issue (cluster not ready, network timeout, resource limit, build failure before Cypress ran) |
| `unknown`     | Insufficient information to classify                                                                           |

Use these signals for classification:

- Runtime < 2 minutes for a Cypress workflow → Cypress likely never ran → `infra`
- If the same test has failed on `main` recently → likely `flaky` or `infra`
- If the failure involves a selector that no longer exists and the PR changed that UI → `product-bug`
- If the error is a generic timeout with no DOM assertion → `infra` or `flaky`
- If the test asserts something that was never correct → `test-bug`
- Cypress exit code 10 → tests ran and failed → likely `product-bug` or `test-bug`

### 8. Produce a report

Output a structured Markdown report:

```markdown
## Cypress Failure Report — PR #<NUMBER>

**PR:** <title>
**Branch:** <branch>
**Analyzed runs:** <list of workflow names>

---

### Failed Tests

#### <Workflow Name>

| Test                | Spec File                     | Error                                       | Category    |
| ------------------- | ----------------------------- | ------------------------------------------- | ----------- |
| `<describe> > <it>` | `tests/namespace/foo.spec.js` | `AssertionError: expected 'X' to equal 'Y'` | product-bug |

---

### Summary

- Total failures: N
- product-bug: N
- flaky: N
- infra: N
- test-bug: N
- unknown: N

### Recommended Actions

- **product-bug**: [describe what changed in the PR that likely caused this]
- **flaky**: These tests are known to be unstable; re-running the CI job may be sufficient
- **infra**: Retry the workflow; if it persists, check cluster provisioning logs
- **test-bug**: [describe the fix needed in the test]
```

## Notes

- Only report on failures from the latest commit on the PR — do not include historical failures from earlier commits.
- If no Cypress checks failed on the latest commit, report "No Cypress failures found for PR #N."
- If artifacts are expired or unavailable, rely on log output and check annotations.
- If logs are also unavailable, infer failures from the PR diff and test source files, and note clearly that the analysis is inferred.
- Do not speculate about fixes unless you have read the relevant source and test files.
- Use the GitHub MCP server tools or `gh` CLI for GitHub API interactions.
