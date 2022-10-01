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

//TODO groupName includes version - what if version is not actual? should we exclude it
//TODO pizza

// "/apis/busola.example.com/v1/namespaces/{namespace}/pizzaorders"
// "/apis/busola.example.com/v1/namespaces/{namespace}/pizzaorders/{name}"
// "/apis/busola.example.com/v1/namespaces/{namespace}/pizzas"
// "/apis/busola.example.com/v1/namespaces/{namespace}/pizzas/{name}"
// "/apis/busola.example.com/v1/pizzaorders"
// "/apis/busola.example.com/v1/pizzas"

export const doesResourceExist = (groupName, resourceName) => {
  const resourceIdList = clusterOpenApi.getResourceNameList;
  const resourceNamePlural = pluralize(resourceName);

  // an example string matching the regex: /(api|apis)/GROUP_NAME/.../RESOURCE_NAME
  const regexString = `^\\/(api|apis)\\/${groupName}\\/.*?\\/${resourceNamePlural}$`;
  const resourceGroupAndKindRegex = new RegExp(regexString, 'i');
  const doesExist = !!resourceIdList.find(resourceId => {
    return resourceGroupAndKindRegex.test(resourceId);
  });

  // console.log(555555, resourceGroupAndKindRegex, doesExist);

  return doesExist;
};

//doesUserHavePermission(['get', 'list', '*'], resource, permissionSet)
const permissions = ['get', 'list'];
export const doesUserHavePermission = (resource, permissionSet) => {
  const { groupName, resourceName } = resource;
  const resourceNamePlural = pluralize(resourceName);

  // console.log(1111, groupName, resourceName, permissionSet);
  const permission = permissionSet.find(set => {
    const isSameApiGroup =
      set.apiGroups?.includes(groupName) || set.apiGroups?.includes('*');
    const isSameResourceName =
      set.resources?.includes(resourceNamePlural) ||
      set.resources?.includes('*');

    // creates a regex such as '^\*$|^VERB1$|^VERB2' etc.
    const permissionRegex = new RegExp(
      `^\\*$|${permissions.map(verb => '^' + verb + '$').join('|')}`,
    );
    // console.log(1212, permissionRegex, set.verbs);
    const areSufficientPermissions = set.verbs?.some(verb => {
      // console.log(33333, verb, permissionRegex);
      return permissionRegex.test(verb);
    });
    // console.log(
    //   2222,
    //   isSameApiGroup,
    //   isSameResourceName,
    //   areSufficientPermissions,
    // );

    return isSameApiGroup && isSameResourceName && areSufficientPermissions;
  });

  return !!permission;
};
