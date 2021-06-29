import { major, satisfies, coerce } from 'semver';
import { PARAMS_VERSION } from './constants';

export function areParamsCompatible(paramsVersion) {
  const majorVersion = major(coerce(PARAMS_VERSION));
  return satisfies(coerce(paramsVersion), `^${coerce(majorVersion)}`);
}

export function showIncompatibleParamsWarning(paramsVersion) {
  const minimalVersion = coerce(major(coerce(PARAMS_VERSION)));
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
