/**
 * Hard upper bounds for load-test workloads. Non-rejection workloads must
 * stay under the backend's 2000/min-per-credential limit, so ratePerMinute
 * is capped at 1800.
 */
export const CAPS = {
  ratePerMinute: 1800,
  durationSec: 120,
  warmupSec: 30,
  maxWorkers: 200,
  timeoutMs: 30000,
};

const POSITIVE_INT_FIELDS = [
  'ratePerMinute',
  'durationSec',
  'warmupSec',
  'maxWorkers',
  'timeoutMs',
];
const AUTH_MODES = ['token', 'cert', 'sso'];
const PAYLOAD_SIZES = ['small', 'medium', 'large'];

/**
 * Throw an Error (message naming the offending field) if any bound is
 * violated or a value is missing/non-numeric. Returns the config on success.
 */
export function validate(config) {
  for (const field of POSITIVE_INT_FIELDS) {
    const value = config[field];
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(
        `Config field "${field}" must be a positive integer, got ${JSON.stringify(value)}`,
      );
    }
    if (value > CAPS[field]) {
      throw new Error(
        `Config field "${field}" exceeds cap ${CAPS[field]}, got ${value}`,
      );
    }
  }
  if (!AUTH_MODES.includes(config.authMode)) {
    throw new Error(
      `Config field "authMode" must be one of ${AUTH_MODES.join(', ')}, got ${JSON.stringify(config.authMode)}`,
    );
  }
  const payloadSize = config.upstream?.payloadSize;
  if (!PAYLOAD_SIZES.includes(payloadSize)) {
    throw new Error(
      `Config field "upstream.payloadSize" must be one of ${PAYLOAD_SIZES.join(', ')}, got ${JSON.stringify(payloadSize)}`,
    );
  }
  return config;
}
