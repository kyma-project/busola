export function extractGroupVersions(apis) {
  const CORE_GROUP = '';
  const CORE_GROUP_VERSION = {
    groupVersion: 'v1',
    version: 'v1',
  };
  return [
    {
      name: CORE_GROUP,
      preferredVersion: CORE_GROUP_VERSION,
      versions: [CORE_GROUP_VERSION],
    },
    ...apis.groups,
  ];
}
