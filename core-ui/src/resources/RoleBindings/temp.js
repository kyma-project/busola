import pluralize from 'pluralize';

export function hasWildcardPermission(permissionSet) {
  return !!permissionSet.find(
    rule =>
      rule.apiGroups[0] === '*' &&
      rule.resources[0] === '*' &&
      rule.verbs[0] === '*',
  );
}

export function hasPermissionsFor(
  apiGroup,
  resourceType,
  groupVersions,
  verbs = [],
) {
  const permissionsForApiGroup = groupVersions.filter(
    p => p.apiGroups.includes(apiGroup) || p.apiGroups[0] === '*',
  );
  const matchingPermission = permissionsForApiGroup.find(p =>
    p.resources.includes(pluralize(resourceType)),
  );
  const wildcardPermission = permissionsForApiGroup.find(
    p => p.resources[0] === '*',
  );

  for (const verb of verbs) {
    if (
      !matchingPermission?.verbs.includes(verb) &&
      !wildcardPermission?.verbs.includes(verb) &&
      matchingPermission?.verbs[0] !== '*' &&
      wildcardPermission?.verbs[0] !== '*'
    ) {
      return false;
    }
  }

  return !!matchingPermission || !!wildcardPermission;
}
