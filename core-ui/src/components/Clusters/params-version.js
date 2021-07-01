import { satisfies, coerce } from 'semver';
import { PARAMS_VERSION } from 'react-shared';

export function formatVersion(version) {
  const fullVersion = coerce(version);
  return `${fullVersion.major}.0`;
}

export function areParamsCompatible(paramsVersion) {
  return satisfies(coerce(paramsVersion), `^${formatVersion(PARAMS_VERSION)}`);
}
