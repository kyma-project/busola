# edit-cluster OOM loop diagnostic probe

Diagnostics-only instrumentation for the intermittent (~1/25, CI-only) renderer OOM crash
that starts while the edit-cluster flow is on screen: CPU pegged >1 core, RSS ratcheting
~450 MB/min to Chrome's ~3.8 GB per-renderer cap, then the renderer is killed. The
edit-cluster assertions pass (~15 s) and the loop runs in the frozen window afterward, so no
Cypress timeout fires and the spec is not marked failed.

**No source/app fixes** — this only captures intel so the loop can be identified in one CI
campaign. Everything is gated behind an env flag and is inert on normal runs.

## What it captures (and why each source)

| Signal                                                                        | Source                                                                | Answers                                                |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| RSS/CPU/VSZ per Chrome process                                                | `chrome-mem.csv` (OS sampler, `.github/scripts/sample-chrome-mem.sh`) | the crash signature; immune to the main-thread peg     |
| Heap / Nodes / listeners over time                                            | `cdp-metrics.jsonl` (CDP `Performance.getMetrics`)                    | what grows; out-of-process                             |
| CPU hotspots                                                                  | `cpu-*.cpuprofile` (CDP `Profiler`)                                   | which functions loop; out-of-process sampling thread   |
| Allocation stacks                                                             | `heap-*.heapprofile` (CDP `HeapProfiler` sampling)                    | what allocates the RSS ratchet                         |
| React commit rate + re-rendering components                                   | `inpage.jsonl` / `live-hold.jsonl`                                    | confirms a render loop + its frequency                 |
| Who schedules the loop (timers/microtasks/promises/observers) call-sites      | `inpage.jsonl`                                                        | the decisive "who keeps calling setState async" signal |
| fetch/XHR URL histogram                                                       | `inpage.jsonl`                                                        | network churn → maps to churning atoms                 |
| swallowed `console.error/warn` (incl. "Maximum update depth", ResizeObserver) | `inpage.jsonl`                                                        | warnings otherwise hidden by `support/exceptions.js`   |

The in-page probe (`support/loop-probe.js`) flushes on a **commit-count cadence** via
`navigator.sendBeacon` (not wall-clock timers, which are starved during the peg) to a Node
HTTP sink in `plugins/index.js` that appends to `inpage.jsonl` immediately — so data reaches
disk even under a hard crash. CDP is driven from `tests/cluster/test-edit-cluster-loop-probe.spec.js`
via Cypress's built-in `remote:debugger:protocol` channel (no extra npm dependency); profiles
are checkpointed periodically so a crash still leaves usable chunks.

## Run the campaign

Trigger the workflow manually with the probe on:

```
gh workflow run pull-integration-cluster-k3d.yml -f loop_probe=true
# rerun until the renderer OOM is caught (the amplifier raises the per-job hit rate)
```

Because `gh run rerun` overwrites the text log (BlobNotFound), grab `gh run view <id> --log`
before rerunning; the uploaded artifacts survive regardless.

Download the `cypress-run-cluster-test` artifact and analyze:

```
node tests/integration/loop-probe/analyze.mjs <path-to>/cypress/loop-probe
```

Open `cpu-*.cpuprofile` in Chrome DevTools (Performance ▸ Load profile) or
<https://speedscope.app>, and `heap-*.heapprofile` in DevTools ▸ Memory ▸ Load.

## Local dry run (verify wiring; the loop will not reproduce locally)

```
cd tests/integration
CYPRESS_LOOP_PROBE=1 npm run test:cluster:local   # or test:cluster against a k3d cluster
```

Confirm `cypress/loop-probe/` fills with `inpage.jsonl`, `cdp-metrics.jsonl`, and
`cpu-*.cpuprofile` / `heap-*.heapprofile`. With the flag unset the probe spec skips and the
run is byte-for-byte unchanged.

## Tunables (Cypress env)

- `LOOP_PROBE_ITERATIONS` (default 25) — amplifier rename cycles.
- `LOOP_PROBE_HOLD_SAMPLES` (default 180) — 2 s live-hold polls (~6 min).
