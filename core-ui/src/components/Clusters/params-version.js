import { major, satisfies, coerce } from 'semver';

export const PARAMS_VERSION = '1.0'; // make sure to sync it in core

export function areParamsCompatible(paramsVersion) {
  const majorVersion = major(coerce(PARAMS_VERSION));
  return satisfies(coerce(paramsVersion), `^${coerce(majorVersion)}`);
}
