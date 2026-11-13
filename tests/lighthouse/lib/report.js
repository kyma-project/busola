import fs from 'fs';
import path from 'path';
import { summarizeSamples } from './aggregate.js';

const REDACTION = '***REDACTED***';

export const resolveRevision = (env = {}) =>
  env.GITHUB_SHA || env.GIT_SHA || 'unknown';

export const resolveSampleCount = (raw, fallback = 3) => {
  if (raw === undefined || raw === null || `${raw}`.trim() === '') {
    return fallback;
  }
  const text = `${raw}`.trim();
  if (!Number.isInteger(Number(text))) {
    throw new Error(`invalid sample count: ${raw} (expected a positive integer)`);
  }
  const count = Number.parseInt(text, 10);
  if (count <= 0) {
    throw new Error(`invalid sample count: ${raw} (expected a positive integer)`);
  }
  return count;
};

export const collectToolVersions = ({
  lighthouseVersion,
  playwrightVersion,
  nodeVersion,
} = {}) => ({
  lighthouse: lighthouseVersion || 'unknown',
  playwright: playwrightVersion || 'unknown',
  node: nodeVersion || 'unknown',
});

export const buildPageReport = ({ name, url, samples }) => {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error(`page "${name}" has no samples`);
  }
  return { name, url, samples, median: summarizeSamples(samples) };
};

export const buildSampleReport = ({
  name,
  url,
  index,
  revision,
  toolVersions,
  settings,
  metrics,
}) => ({
  schema: 'busola-lighthouse-sample',
  name,
  url,
  index,
  revision,
  toolVersions,
  settings,
  metrics,
});

export const buildSummary = ({
  revision,
  toolVersions,
  settings,
  pages,
  generatedAt,
}) => {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('summary requires at least one page');
  }
  return {
    schema: 'busola-lighthouse-summary',
    generatedAt,
    revision,
    toolVersions,
    settings,
    pages,
  };
};

export const writeSummary = (summary, filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  return filePath;
};

const listFiles = (directory) => {
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
};

export const sanitizeReports = ({ directory, secrets }) => {
  const active = (secrets || []).filter(
    (secret) => typeof secret === 'string' && secret.trim() !== '',
  );
  if (active.length === 0) {
    return 0;
  }
  let modified = 0;
  for (const file of listFiles(directory)) {
    const original = fs.readFileSync(file, 'utf8');
    let content = original;
    for (const secret of active) {
      content = content.split(secret).join(REDACTION);
    }
    if (content !== original) {
      fs.writeFileSync(file, content);
      modified += 1;
    }
  }
  return modified;
};

export const assertNoSecrets = ({ directory, secrets }) => {
  const active = (secrets || []).filter(
    (secret) => typeof secret === 'string' && secret.trim() !== '',
  );
  if (active.length === 0) {
    return;
  }
  for (const file of listFiles(directory)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const secret of active) {
      if (content.includes(secret)) {
        throw new Error(`secret leaked into report file: ${file}`);
      }
    }
  }
};
