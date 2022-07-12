import * as jp from 'jsonpath';

const SUPPORTED_VERSIONS = [
  { version: '0.4', latest: false },
  { version: '0.5', latest: true },
];

export const getSupportedVersions = () =>
  SUPPORTED_VERSIONS.map(version => version.version).sort();
export const getLatestVersion = () =>
  SUPPORTED_VERSIONS.find(version => version.latest)?.version;

export function migrateToLatest(resource) {
  if (!resource) return undefined;

  const newestVersion = getLatestVersion();
  const currentVersion = resource?.data?.version;

  const functionName = `migrateFrom${currentVersion.replace('.', '')}`;
  console.log('functionName', functionName, 'resource', resource);
  const newResource =
    currentVersion !== newestVersion
      ? migrateFunctions[functionName](resource)
      : resource;

  return newResource;
}
const migrateFunctions = {};

migrateFunctions.migrateFrom04 = resource => {
  const newResource = JSON.parse(JSON.stringify(resource));
  if (newResource.data.version === '0.4') {
    jp.value(newResource, `$.data.version`, '0.5');
  }

  return migrateToLatest(newResource);
};
