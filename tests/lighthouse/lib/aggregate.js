const METRIC_KEYS = ['fcp', 'lcp', 'tbt', 'cls', 'performanceScore'];

export const median = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('median requires a non-empty array');
  }
  const sorted = [...values].sort((a, b) => a - b);
  for (const value of sorted) {
    if (!Number.isFinite(value)) {
      throw new Error(`median requires finite values (got ${String(value)})`);
    }
  }
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

export const summarizeSamples = (samples) => {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error('summarizeSamples requires a non-empty sample set');
  }
  const summary = {};
  for (const key of METRIC_KEYS) {
    summary[key] = median(samples.map((sample) => sample[key]));
  }
  return summary;
};
