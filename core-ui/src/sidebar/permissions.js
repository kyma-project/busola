import pluralize from 'pluralize';

export const doesResourceExist = ({
  resourceGroupAndVersion,
  resourceKind,
  resourceIdList,
}) => {
  const resourceNamePlural = pluralize(resourceKind);

  const resourcePathId = `/${
    resourceGroupAndVersion === 'v1' ? 'api' : 'apis'
  }/${resourceGroupAndVersion}/${resourceNamePlural}`.toLowerCase();

  const doesExist = !!resourceIdList.includes(resourcePathId);

  return doesExist;
};

export const doesUserHavePermission = (
  permissions = ['get', 'list'],
  resource,
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
