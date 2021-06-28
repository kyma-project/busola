const PARAMS_VERSION = 1; // make sure to sync it in core-ui
const PREV_SUPPORTED_VERSIONS = 1;

export function areParamsCompatible(paramsVersion) {
  if (typeof paramsVersion !== 'number') {
    return false;
  }
  return (
    paramsVersion <= PARAMS_VERSION &&
    paramsVersion >= PARAMS_VERSION - PREV_SUPPORTED_VERSIONS
  );
}

export function showIncompatibleParamsWarning(paramsVersion) {
  // we can't use Luigi alert here
  alert(
    `Configuration incompatible: version: ${
      typeof paramsVersion === 'number' ? paramsVersion : "'unknown'"
    }, supported version: ${PARAMS_VERSION}. Errors may occur.`,
  );
}
