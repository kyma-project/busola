import { major, satisfies, coerce } from 'semver';

const PARAMS_VERSION = '1.0'; // make sure to sync it in core-ui

export function areParamsCompatible(paramsVersion) {
  const majorVersion = major(coerce(PARAMS_VERSION));
  return satisfies(coerce(paramsVersion), `^${coerce(majorVersion)}`);
}

export function showIncompatibleParamsWarning(paramsVersion) {
  const message = `Configuration incompatible: version: ${paramsVersion ||
    "'unknown'"}, supported version: ${PARAMS_VERSION}. Errors may occur.`;

  const showAlert = Luigi.initialized
    ? text =>
        Luigi.ux().showAlert({
          text,
          type: 'warning',
        })
    : alert;

  showAlert(message);
}
