import rbacRulesMatched from './rbac-rules-matcher';

let selfSubjectRulesReview = [];
export let crds = [];

export function setInitValues(_crds, _selfSubjectRulesReview) {
  crds = _crds.map((crd) => crd.name);
  selfSubjectRulesReview = _selfSubjectRulesReview;
}

function checkRequiredCrds(nodeToCheckPermissionsFor) {
  let hasPermissions = true;
  if (
    nodeToCheckPermissionsFor.context &&
    nodeToCheckPermissionsFor.context.requiredCrds &&
    nodeToCheckPermissionsFor.context.requiredCrds.length > 0
  ) {
    if (crds && crds.length > 0) {
      nodeToCheckPermissionsFor.context.requiredCrds.forEach(
        (module) => {
          if (hasPermissions && crds.indexOf(module) === -1) {
            hasPermissions = false;
          }
        }
      );
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
    checkRequiredCrds(nodeToCheckPermissionsFor)
  );
}
