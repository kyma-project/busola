import rbacRulesMatched from './rbac-rules-matcher';
import _ from 'lodash';
import pluralize from 'pluralize';
import { clusterOpenApi } from './clusterOpenApi';

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

export function hasAnyRoleBound(permissionSet) {
  const ssrr = {
    apiGroups: ['authorization.k8s.io'],
    resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
    verbs: ['create'],
  };

  const filterSelfSubjectRulesReview = permission =>
    !_.isEqual(permission, ssrr);

  // leave out ssrr permission, as it's always there
  permissionSet = permissionSet.filter(filterSelfSubjectRulesReview);

  const verbs = permissionSet.flatMap(p => p.verbs);

  const usefulVerbs = [
    'get',
    'list',
    'watch',
    'create',
    'update',
    'patch',
    'delete',
    '*',
  ];

  return verbs.some(v => usefulVerbs.includes(v));
}

export const doesResourceExist = (groupName, resourceName) => {
  const resourceIdList = clusterOpenApi.getResourceNameList;

  const reversedGroupName = groupName
    .split('.')
    .reverse()
    .join('.');
  const singularResourceName = pluralize(resourceName, 1);
  const singularNameRegex = new RegExp(`${singularResourceName}$`, 'i');

  const doesExists = !!resourceIdList.find(resourceId => {
    return (
      resourceId.startsWith(reversedGroupName) &&
      singularNameRegex.test(resourceId)
    );
  });

  return doesExists;
};

//doesUserHavePermission(['get', 'list', '*'], resource, permissionSet)
const permissions = ['get', 'list'];
export const doesUserHavePermission = (resource, permissionSet) => {
  const { groupName, resourceName } = resource;

  console.log(1111, groupName, resourceName, permissionSet);
  const permission = permissionSet.find(set => {
    const sameApiGroup =
      set.apiGroups?.includes(groupName) || set.apiGroups?.includes('*');
    const sameResourceName =
      set.resources?.includes(resourceName) || set.resources?.includes('*');

    const permissionRegex = new RegExp( // formats '^get$|^list$|^\*$' etc.
      `^\\*$|${permissions.map(verb => '^' + verb + '$').join('|')}`,
    );
    console.log(1212, permissionRegex, set.verbs);
    const sufficientPermissions = set.verbs?.some(verb => {
      console.log(33333, verb, permissionRegex);
      return permissionRegex.test(verb);
    });
    console.log(2222, sameApiGroup, sameResourceName, sufficientPermissions);

    return sameApiGroup && sameResourceName && sufficientPermissions;
  });

  return !!permission;
};
