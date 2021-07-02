import { satisfies, coerce } from 'semver';

export const PARAMS_VERSION = '1.0'; // make sure to sync it in core

export function formatVersion(version) {
  const fullVersion = coerce(version);
  return `${fullVersion.major}.0`;
}

export function areParamsCompatible(paramsVersion) {
  return satisfies(coerce(paramsVersion), `^${formatVersion(PARAMS_VERSION)}`);
}
