const METRIC_KEYS = ['fcp', 'lcp', 'tbt', 'cls', 'performanceScore'];

export const median = (values) => {
  if (!values?.length) throw new Error('median requires a non-empty array');
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

export const summarizeSamples = (samples) => {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error('summarizeSamples requires a non-empty sample set');
  }
  for (const sample of samples) {
    for (const key of METRIC_KEYS) {
      if (!(key in sample)) {
        throw new Error(`sample is missing required metric: ${key}`);
      }
    }
  }
  const summary = {};
  for (const key of METRIC_KEYS) {
    summary[key] = median(samples.map((sample) => sample[key]));
  }
  return summary;
};
