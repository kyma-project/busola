export function extractGroupVersions(apis) {
  const CORE_GROUP = 'v1';
  return [
    CORE_GROUP,
    ...apis.groups.flatMap(group =>
      group.versions.map(version => version.groupVersion),
    ),
  ];
}
