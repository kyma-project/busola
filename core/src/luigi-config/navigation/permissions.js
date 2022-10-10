import _ from 'lodash';
import pluralize from 'pluralize';
import { clusterOpenApi } from './clusterOpenApi';

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

export const doesResourceExist = ({
  resourceGroupAndVersion,
  resourceKind,
}) => {
  const resourceIdList = clusterOpenApi.getResourcePathIdList;
  const resourceNamePlural = pluralize(resourceKind);

  const resourcePathId = `/${
    resourceGroupAndVersion === 'v1' ? 'api' : 'apis'
  }/${resourceGroupAndVersion}/${resourceNamePlural}`.toLowerCase();

  const doesExist = !!resourceIdList.includes(resourcePathId);

  return doesExist;
};

export const doesUserHavePermission = (
  permissions = ['get', 'list'],
  resource = { resourceGroupAndVersion: '', resourceKind: '' },
  permissionSet,
) => {
  let { resourceGroupAndVersion, resourceKind } = resource;

  const resourceKindPlural = pluralize(resourceKind);
  const resourceGroup = getResourceGroup(resourceGroupAndVersion);

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

const getResourceGroup = resourceGroupAndVersion => {
  // native resources don't have resourceGroup
  if (resourceGroupAndVersion === 'v1') return '';
  return resourceGroupAndVersion.split('/')[0];
};
