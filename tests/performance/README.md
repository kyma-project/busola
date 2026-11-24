# Busola component performance tests

Component-level rendering performance suite for critical Busola UI components. Tests run in-browser via Cypress component testing with [`React.Profiler`](https://react.dev/reference/react/Profiler), so they measure real render durations without requiring a Kubernetes cluster.

## Running the tests

From the repo root:

```bash
# Headless (CI-style, Chrome)
npm run perf-test

# Interactive Cypress UI
npm run perf-test:open

# Unit tests for lib/ helpers (Vitest)
npm test -- tests/performance/lib/perf-helpers.test.ts
```

## Covered scenarios

Each scenario runs **5 samples per dataset size** (`small` = 10 entries, `medium` = 100 entries, `large` = 1000 entries) and records three metrics per sample. The row renderer uses 5 columns — four plain strings plus a `LabelChips` component cell (inline span chips) — matching the structural complexity of typical resource lists such as Secrets, without the UI5 custom-element overhead that would inflate the DOM at scale.

| Metric            | Source                | Meaning                                                                        |
| ----------------- | --------------------- | ------------------------------------------------------------------------------ |
| `actualDuration`  | `React.Profiler`      | Time spent rendering committed subtree (excluding memoized children)           |
| `baseDuration`    | `React.Profiler`      | Estimated time to render the whole subtree without any memoization             |
| `browserDuration` | `performance.measure` | Wall-clock time of the user interaction (from start of action to React commit) |

### GenericList

| Scenario                   | Description                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Mount**                  | Initial render with an empty filter and default sort                                  |
| **Filter**                 | Typing into the search field and measuring subsequent re-renders                      |
| **Sort**                   | Opening the sort modal, selecting a column, and confirming                            |
| **Pagination**             | Navigating to the next page (`itemsPerPage: 10`)                                      |
| **Entry update (polling)** | Replacing the full entry set via `useState` to simulate a Kubernetes watch/poll cycle |

## Report format

After a successful run, `tests/performance/reports/GenericList-summary.json` is written with this shape:

```json
{
  "schema": "busola-cypress-perf-summary",
  "component": "GenericList",
  "generatedAt": "2026-01-01T12:00:00.000Z",
  "settings": { "samples": 5 },
  "scenarios": [
    {
      "scenario": "mount",
      "datasetSize": "small",
      "samples": [...],
      "median": {
        "actualDuration": 12.5,
        "baseDuration": 18.3,
        "browserDuration": 25.1
      }
    }
  ]
}
```

The `median` object for each scenario holds the **median** of each metric across all samples. Medians are used (rather than mean or min) because they are robust to occasional slow outliers from GC pauses or browser scheduling jitter.

The report directory is git-ignored (`tests/performance/reports/`) and uploaded as a CI artifact when tests run on a PR.

## Interpreting results

- **`actualDuration` increasing with dataset size** is expected — it reflects O(n) work in the render tree.
- **Large jumps between `small` and `medium`** (not proportional to 10×) can indicate a performance cliff (e.g. unoptimised sort, synchronous filtering of the full list on every keystroke).
- **`browserDuration` >> `actualDuration`** in the sort or filter scenarios can point to layout/paint bottlenecks outside React.
- These tests do **not** enforce thresholds — they produce a report for trend tracking across PRs.

## Project structure

```
tests/performance/
├── lib/
│   ├── aggregate.ts           # median() and summarizeSamples()
│   ├── fixtures.ts            # generateEntries() — creates K8s-like test data
│   ├── metrics.ts             # validateSample(), measureInteraction()
│   ├── perf-helpers.test.ts   # Vitest unit tests for lib/ helpers
│   └── report.ts              # buildSummary(), writeSummary()
├── reports/                   # git-ignored, written at runtime
├── support.tsx                # cy.mountWithProfiler() custom command
└── GenericList.perf.cy.tsx    # GenericList performance scenarios
```
