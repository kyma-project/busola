import { summarizeSamples } from '../lib/aggregate';
import type { RenderSample } from '../lib/metrics';

const REPORT_DIR = 'tests/performance/reports';

export type SampleReport = {
  schema: 'busola-cypress-perf-sample';
  component: string;
  scenario: string;
  datasetSize: string;
  index: number;
  settings: { samples: number };
  metrics: RenderSample;
};

export type ScenarioSummary = {
  scenario: string;
  datasetSize: string;
  samples: RenderSample[];
  median: ReturnType<typeof summarizeSamples>;
};

export type PerfSummary = {
  schema: 'busola-cypress-perf-summary';
  component: string;
  generatedAt: string;
  settings: { samples: number };
  scenarios: ScenarioSummary[];
};

export function buildSampleReport(
  component: string,
  scenario: string,
  datasetSize: string,
  index: number,
  samples: number,
  metrics: RenderSample,
): SampleReport {
  return {
    schema: 'busola-cypress-perf-sample',
    component,
    scenario,
    datasetSize,
    index,
    settings: { samples },
    metrics,
  };
}

export function buildSummary(
  component: string,
  settings: { samples: number },
  scenarios: ScenarioSummary[],
): PerfSummary {
  if (scenarios.length === 0) {
    throw new Error('summary requires at least one scenario');
  }
  return {
    schema: 'busola-cypress-perf-summary',
    component,
    generatedAt: new Date().toISOString(),
    settings,
    scenarios,
  };
}

export function buildScenarioSummary(
  scenario: string,
  datasetSize: string,
  samples: RenderSample[],
): ScenarioSummary {
  return { scenario, datasetSize, samples, median: summarizeSamples(samples) };
}

export function writeSummary(summary: PerfSummary): void {
  cy.writeFile(
    `${REPORT_DIR}/${summary.component}-summary.json`,
    JSON.stringify(summary, null, 2),
  );

  const lines = [
    `\n=== ${summary.component} perf summary (${summary.generatedAt}) ===`,
    ...summary.scenarios.map(s =>
      [
        `  ${s.scenario} / ${s.datasetSize}`,
        `    actualDuration  median: ${s.median.actualDuration.toFixed(2)}ms`,
        `    baseDuration    median: ${s.median.baseDuration.toFixed(2)}ms`,
        `    browserDuration median: ${s.median.browserDuration.toFixed(2)}ms`,
        `    commitCount     median: ${s.median.commitCount.toFixed(1)}`,
      ].join('\n'),
    ),
  ];
  cy.log(lines.join('\n'));
}
