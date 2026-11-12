export function isValidMeasurement(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function median(nums) {
  if (!nums.length) throw new Error('median() requires a non-empty array');
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function aggregatePhase(metrics, phase, invalid) {
  const out = {};
  for (const [metric, samples] of Object.entries(metrics)) {
    const valid = [];
    samples.forEach((s, i) => {
      if (isValidMeasurement(s)) valid.push(s);
      else invalid.push(`${phase}.${metric}[${i}]`);
    });
    out[metric] = { samples, median: valid.length ? median(valid) : null };
  }
  return out;
}

export function aggregateScenario(name, samples) {
  const invalid = [];
  const cold = aggregatePhase(samples.cold ?? {}, 'cold', invalid);
  const warm = aggregatePhase(samples.warm ?? {}, 'warm', invalid);
  return { name, cold, warm, invalid };
}
