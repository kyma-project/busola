export const METRIC_KEYS = [
  'actualDuration',
  'baseDuration',
  'browserDuration',
  'commitCount',
] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

export type RenderSample = {
  actualDuration: number;
  baseDuration: number;
  browserDuration: number;
  commitCount: number;
};

const assertFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`invalid measurement: ${label} (got ${String(value)})`);
  }
};

export function validateSample(sample: RenderSample): void {
  assertFinite(sample.actualDuration, 'actualDuration');
  assertFinite(sample.baseDuration, 'baseDuration');
  assertFinite(sample.browserDuration, 'browserDuration');
  assertFinite(sample.commitCount, 'commitCount');
}

export function measureInteraction(
  label: string,
  action: () => Cypress.Chainable | void,
): Cypress.Chainable<number> {
  performance.mark(`${label}:start`);
  const result = action();

  const wait: Cypress.Chainable = result ?? cy.wrap(null, { log: false });
  return wait.then(() => {
    performance.mark(`${label}:end`);
    performance.measure(label, `${label}:start`, `${label}:end`);
    const entry = performance.getEntriesByName(label).at(-1)!;
    performance.clearMarks(`${label}:start`);
    performance.clearMarks(`${label}:end`);
    performance.clearMeasures(label);
    assertFinite(entry.duration, label);
    return entry.duration;
  }) as Cypress.Chainable<number>;
}
