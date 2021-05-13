import rbacRulesMatched from './rbac-rules-matcher';

function checkRequiredModules(nodeToCheckPermissionsFor, crds) {
  const requiredModules = nodeToCheckPermissionsFor.context?.requiredModules;
  let hasPermissions = true;
  if (requiredModules?.length > 0) {
    if (crds?.length > 0) {
      requiredModules.forEach((module) => {
        const moduleExists = crds.some((crd) => crd.includes(module));
        if (hasPermissions && !moduleExists) {
          hasPermissions = false;
        }
      });
    } else {
      hasPermissions = false;
    }
  }
  return hasPermissions;
}

export function navigationPermissionChecker(
  nodeToCheckPermissionsFor,
  selfSubjectRulesReview,
  crds
) {
  const noRulesApplied =
    !Array.isArray(nodeToCheckPermissionsFor.requiredPermissions) ||
    !nodeToCheckPermissionsFor.requiredPermissions.length;

  return (
    (noRulesApplied ||
      rbacRulesMatched(
        nodeToCheckPermissionsFor.requiredPermissions,
        selfSubjectRulesReview
      )) &&
    checkRequiredModules(nodeToCheckPermissionsFor, crds)
  );
}

export function hasWildcardPermission(selfSubjectRulesReview) {
  return !!selfSubjectRulesReview.find(
    (rule) =>
      rule.apiGroups[0] === '*' &&
      rule.resources[0] === '*' &&
      rule.verbs[0] === '*'
  );
}
