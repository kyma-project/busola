import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

const SUPPORTED_VERSIONS = [
  { version: '0.4', latest: false },
  { version: '0.5', latest: true },
];

export const getSupportedVersions = () =>
  SUPPORTED_VERSIONS.map(version => version.version).sort();

export const getLatestVersion = () =>
  SUPPORTED_VERSIONS.find(version => version.latest)?.version;
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
  const currentVersion = formatCurrentVersion(resource?.data?.version);

  const functionName = currentVersion.replace('.', '');
  const newResource =
    currentVersion !== newestVersion
      ? migrateFunctions[functionName](resource)
      : resource;

  return newResource;
}
const migrateFunctions = {};

// Definitions of functions used for migration.
// The naming convention: use number version string but without a dot
migrateFunctions['03'] = resource => {
  const newResource = cloneDeep(resource);
  if (formatCurrentVersion(newResource?.data?.version) === '0.3') {
    jp.value(newResource, `$.data.version`, '0.4');
  }

  return migrateToLatest(newResource);
};

migrateFunctions['04'] = resource => {
  const newResource = cloneDeep(resource);
  if (formatCurrentVersion(newResource?.data?.version) === '0.4') {
    jp.value(newResource, `$.data.version`, '0.5');
  }

  return migrateToLatest(newResource);
};

export const getMigrationFunctions = () => Object.keys(migrateFunctions);
