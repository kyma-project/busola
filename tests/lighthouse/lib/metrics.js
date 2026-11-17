export const PERFORMANCE_AUDIT_KEYS = {
  fcp: 'first-contentful-paint',
  lcp: 'largest-contentful-paint',
  tbt: 'total-blocking-time',
  cls: 'cumulative-layout-shift',
};

const assertFinite = (value, label) => {
  if (!Number.isFinite(value)) {
    throw new Error(`invalid measurement: ${label} (got ${String(value)})`);
  }
};

export const extractMetrics = (lhr) => {
  if (!lhr) {
    throw new Error('invalid measurement: missing Lighthouse result');
  }
  if (lhr.runtimeError) {
    throw new Error(
      `Lighthouse runtime error: ${lhr.runtimeError.code || 'unknown'}`,
    );
  }

  const performance = lhr.categories && lhr.categories.performance;
  if (!performance) {
    throw new Error('invalid measurement: missing performance category');
  }
  const score = performance.score;
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new Error(
      `invalid measurement: performance score (got ${String(score)})`,
    );
  }

  const metrics = { performanceScore: score * 100 };
  for (const [metric, auditKey] of Object.entries(PERFORMANCE_AUDIT_KEYS)) {
    const audit = lhr.audits && lhr.audits[auditKey];
    if (!audit) {
      throw new Error(`invalid measurement: missing audit ${auditKey}`);
    }
    if (audit.scoreDisplayMode === 'error') {
      throw new Error(`invalid measurement: audit ${auditKey} is in error`);
    }
    assertFinite(audit.numericValue, auditKey);
    metrics[metric] = audit.numericValue;
  }

  return {
    fcp: metrics.fcp,
    lcp: metrics.lcp,
    tbt: metrics.tbt,
    cls: metrics.cls,
    performanceScore: metrics.performanceScore,
  };
};
