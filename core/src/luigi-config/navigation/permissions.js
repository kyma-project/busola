import rbacRulesMatched from './rbac-rules-matcher';

let selfSubjectRulesReview = [];
export let crds = [];

export function setInitValues(_crds, _selfSubjectRulesReview) {
  crds = _crds.map((crd) => crd.name);
  selfSubjectRulesReview = _selfSubjectRulesReview;
}

function checkRequiredModules(nodeToCheckPermissionsFor) {
  let hasPermissions = true;
  if (
    nodeToCheckPermissionsFor.context &&
    nodeToCheckPermissionsFor.context.requiredModules &&
    nodeToCheckPermissionsFor.context.requiredModules.length > 0
  ) {
    if (crds && crds.length > 0) {
      nodeToCheckPermissionsFor.context.requiredModules.forEach((module) => {
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

export default function navigationPermissionChecker(nodeToCheckPermissionsFor) {
  const noRulesApplied =
    !Array.isArray(nodeToCheckPermissionsFor.requiredPermissions) ||
    !nodeToCheckPermissionsFor.requiredPermissions.length;

  return (
    (noRulesApplied ||
      rbacRulesMatched(
        nodeToCheckPermissionsFor.requiredPermissions,
        selfSubjectRulesReview
      )) &&
    checkRequiredModules(nodeToCheckPermissionsFor)
  );
}
