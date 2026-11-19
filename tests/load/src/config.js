import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validate } from '../config/caps.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultsPath = path.join(here, '..', 'config', 'default.json');

/**
 * Load a workload config (JSON) merged over the committed defaults, then
 * validate it against the hard caps. Throws (naming the offending field) on
 * any invalid/out-of-bounds value — callers must let that abort the run
 * before any traffic is generated.
 *
 * @param {string} [configPath] path to a JSON override; defaults only if omitted
 * @returns resolved, validated config
 */
export function loadConfig(configPath) {
  const defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8'));
  let fileConfig = {};
  if (configPath) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  const merged = {
    ...defaults,
    ...fileConfig,
    upstream: { ...defaults.upstream, ...(fileConfig.upstream || {}) },
  };
  validate(merged);
  return merged;
}
