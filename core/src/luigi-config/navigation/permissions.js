import rbacRulesMatched from './rbac-rules-matcher';

export function navigationPermissionChecker(
  nodeToCheckPermissionsFor,
  selfSubjectRulesReview,
) {
  const noRulesApplied =
    !Array.isArray(nodeToCheckPermissionsFor.requiredPermissions) ||
    !nodeToCheckPermissionsFor.requiredPermissions.length;

  return (
    noRulesApplied ||
    rbacRulesMatched(
      nodeToCheckPermissionsFor.requiredPermissions,
      selfSubjectRulesReview,
    )
  );
}

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
  permissionSet,
  verbs = [],
) {
  const permissionsForApiGroup = permissionSet.filter(
    p => p.apiGroups.includes(apiGroup) || p.apiGroups[0] === '*',
  );
  const matchingPermission = permissionsForApiGroup.find(p =>
    p.resources.includes(resourceType),
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
