# Skill: Analyze Cypress Integration Test Failures

Analyze Cypress integration test failures for a given GitHub PR in the busola repository.

## Usage

```
/analyse-test [PR Number]
```

- `PR Number` : GitHub PR number to analyze.

**Important:** The only shell command you may execute is `.github/scripts/fetch_failed_jobs.sh`. Do not run any other `gh`, `curl`, `node`, or shell commands. Read all downloaded files using the Read tool.

## Steps

### 1. Identify the PR

Extract the PR number from the user's input. The repo is `kyma-project/busola`.

### 2. Download logs and artifacts

Run the script to download logs and artifacts for all failed jobs:

```bash
PR_NUMBER=<PR_NUMBER> bash .github/scripts/fetch_failed_jobs.sh
```

The script outputs a `TMP_DIR` path as its last line. Note it — all subsequent analysis reads files from that directory using the Read tool.

Each failed job gets a subdirectory under `TMP_DIR` named after the job, containing:

- `<RUN_ID>-<JOB_ID>.log` — failed-step logs
- `artifacts/` — downloaded run artifacts

### 3. Identify failed Cypress checks

Only analyze the **latest** check run for each workflow (associated with the current HEAD commit). Do not report on failures from earlier commits.

From the downloaded logs, identify which jobs correspond to Cypress workflows:

- `run-namespace-test` → namespace tests (`tests/namespace/*.spec.js`)
- `run-cluster-test` → cluster + extensibility + companion tests (`tests/cluster/*.spec.js`, `tests/extensibility/*.spec.js`, `tests/companion/*.spec.js`)
- `run-smoke-test-stage` → smoke tests
- `run-unit-and-component-test` → unit + component tests (Cypress component tests)
- `run-accessibility-tests` → accessibility tests
- `run-integration-test` → Kyma e2e tests (`tests/kyma*/*.spec.js`)

### 4. Parse failure details from logs

Read the `.log` files using the Read tool. Look for:

- `AssertionError` — assertion mismatches (expected vs actual values)
- `CypressError` — timeouts, element not found, network failures
- `Error: Timed out` — step/hook timeouts
- Lines starting with `✗` or `×` — failed test names
- `after each` / `before each` hook failures — setup/teardown issues
- Cypress exit code 10 — means tests ran and some failed
- "No files were found with the provided path" — means Cypress never ran (infra failure)

To distinguish infra from Cypress failure, check the step names in the log:

- Steps named `Run Cypress tests`, `cypress run` → Cypress ran → parse logs
- Steps named `Checkout`, `Setup Node`, `Provision cluster`, `Wait for cluster` → infra failure before Cypress → classify as `infra`
- Runtime < 2 minutes with no Cypress output → `infra`

Extract for each failure:

- Spec file name (e.g. `tests/companion/test-companion-ui.spec.js`)
- Test title (full `describe` + `it` path)
- Error type and message
- Line number if available

### 5. Correlate failures with source files

For each failing spec, read the test file in the repo to understand what the test is asserting and what Kubernetes resource or UI flow it covers.

### 6. Check recent main branch runs for flakiness

Read the logs of recent `main` branch runs for the same workflow from the artifacts directory, if available. Otherwise infer from the log content whether the failure pattern looks intermittent.

- If the same test has failed on `main` recently → likely `flaky` or `infra`

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
- If the script produces no output or exits with an error, report that and do not execute any other commands.
- Do not speculate about fixes unless you have read the relevant source and test files.
