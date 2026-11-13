import { execSync } from 'child_process';
import { getSampleCount } from './measure.js';
import { LARGE_LIST_SIZE } from './fixtures.js';

function buildVersion() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Build the report metadata: build version (git sha), browser version (passed in
 * from Playwright), sample count, and the dataset size each scenario exercised.
 */
export function getMeta(browserVersion) {
  return {
    buildVersion: buildVersion(),
    browserVersion,
    sampleCount: getSampleCount(),
    datasetSizes: {
      'cluster-overview': 3,
      'resource-list': LARGE_LIST_SIZE,
      'monaco-editor': 3,
    },
  };
}
