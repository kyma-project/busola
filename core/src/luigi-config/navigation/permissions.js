import _ from 'lodash';
import pluralize from 'pluralize';
import { clusterOpenApi } from './clusterOpenApi';

export function hasPermissionsFor(
  apiGroup,
  resourceType,
  groupVersions,
  verbs = [],
) {
  // const permissionsForApiGroup = groupVersions.filter(
  //   p => p.apiGroups.includes(apiGroup) || p.apiGroups[0] === '*',
  // );
  // const matchingPermission = permissionsForApiGroup.find(p =>
  //   p.resources.includes(pluralize(resourceType)),
  // );
  // const wildcardPermission = permissionsForApiGroup.find(
  //   p => p.resources[0] === '*',
  // );
  //
  // for (const verb of verbs) {
  //   if (
  //     !matchingPermission?.verbs.includes(verb) &&
  //     !wildcardPermission?.verbs.includes(verb) &&
  //     matchingPermission?.verbs[0] !== '*' &&
  //     wildcardPermission?.verbs[0] !== '*'
  //   ) {
  //     return false;
  //   }
  // }
  //
  // return !!matchingPermission || !!wildcardPermission;
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

export const doesResourceExist = ({ resourceGroup, resourceKind }) => {
  const resourceIdList = clusterOpenApi.getResourceNameList;
  const resourceNamePlural = pluralize(resourceKind);

  // an example string matching the regex: /(api|apis)/GROUP_NAME/.../RESOURCE_NAME
  const regexString = `^\\/(api|apis)\\/${resourceGroup}\\/.*?\\/${resourceNamePlural}$`;
  const resourceGroupAndKindRegex = new RegExp(regexString, 'i');
  const doesExist = !!resourceIdList.find(resourceId => {
    return resourceGroupAndKindRegex.test(resourceId);
  });

  return doesExist;
};

export const doesUserHavePermission = (
  permissions = ['get', 'list'],
  resource = { resourceGroup: '', resourceKind: '' },
  permissionSet,
) => {
  const { resourceGroup, resourceKind } = resource;
  const resourceKindPlural = pluralize(resourceKind);

  const isPermitted = permissionSet.find(set => {
    const isSameApiGroup =
      set.apiGroups?.includes(resourceGroup) || set.apiGroups?.includes('*');

    const isSameResourceKind =
      set.resources?.includes(resourceKindPlural) ||
      set.resources?.includes('*');

    // creates a regex such as '^\*$|^VERB1$|^VERB2' etc.
    const permissionRegex = new RegExp(
      `^\\*$|${permissions.map(verb => '^' + verb + '$').join('|')}`,
    );
    const areSufficientPermissions = set.verbs?.some(verb => {
      return permissionRegex.test(verb);
    });

    return isSameApiGroup && isSameResourceKind && areSufficientPermissions;
  });

  return !!isPermitted;
};
