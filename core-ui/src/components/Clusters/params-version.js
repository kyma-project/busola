export const PARAMS_VERSION = 1; // make sure to sync it in core
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
