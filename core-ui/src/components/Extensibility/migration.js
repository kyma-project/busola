import { EXTENSION_VERSION_LABEL } from 'components/BusolaExtensions/constants';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

const versionPath = `$.metadata.labels["${EXTENSION_VERSION_LABEL}"]`;
const SUPPORTED_VERSIONS = ['0.4', '0.5'];
const LATEST_VERSION = '0.5';

export const getSupportedVersions = () => SUPPORTED_VERSIONS;
export const getLatestVersion = () => LATEST_VERSION;
export const formatCurrentVersion = version => {
  if (!version) return null;
  return (
    version
      .toString()
      .replaceAll("'", '')
      .replaceAll('"', '') || ''
  );
};

export function migrateToLatest(resource) {
  if (!resource) return undefined;

  const newestVersion = getLatestVersion();
  const currentVersion = formatCurrentVersion(jp.value(resource, versionPath));

  const newResource =
    currentVersion !== newestVersion
      ? migrateFunctions[currentVersion](resource)
      : resource;

  return newResource;
}
const migrateFunctions = {};

// Definitions of functions used for migration.
migrateFunctions['0.3'] = resource => {
  const newResource = cloneDeep(resource);
  if (formatCurrentVersion(jp.value(newResource, versionPath)) === '0.3') {
    jp.value(newResource, versionPath, '0.4');
  }

  return migrateToLatest(newResource);
};

migrateFunctions['0.4'] = resource => {
  const newResource = cloneDeep(resource);
  if (formatCurrentVersion(jp.value(newResource, versionPath)) === '0.4') {
    jp.value(newResource, versionPath, '0.5');
  }

  return migrateToLatest(newResource);
};

export const getMigrationFunctions = () => Object.keys(migrateFunctions);
