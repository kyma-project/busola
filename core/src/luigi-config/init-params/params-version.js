import { major, satisfies, coerce } from 'semver';
import { PARAMS_VERSION } from './constants';

export function formatVersion(version) {
  const fullVersion = coerce(version);
  return `${fullVersion.major}.0`;
}

export function areParamsCompatible(paramsVersion) {
  return satisfies(coerce(paramsVersion), `^${formatVersion(PARAMS_VERSION)}`);
}

export function showIncompatibleParamsWarning(paramsVersion) {
  const minimalVersion = formatVersion(PARAMS_VERSION);
  const message = `Configuration incompatible: version: ${paramsVersion ||
    "'unknown'"}, supported versions: ^${minimalVersion}. Errors may occur.`;

  const showAlert = Luigi.initialized
    ? text =>
        Luigi.ux().showAlert({
          text,
          type: 'warning',
        })
    : alert;

  showAlert(message);
}
