import pluralize from 'pluralize';
import { PermissionSetState } from 'state/permissionSetsSelector';

export const doesResourceExist = ({
  resourceGroupAndVersion,
  resourceKind,
  resourceIdList,
}: {
  resourceGroupAndVersion: string;
  resourceKind: string;
  resourceIdList: string[];
}) => {
  const resourceNamePlural = pluralize(resourceKind);

  const resourcePathId = `/${
    resourceGroupAndVersion === 'v1' ? 'api' : 'apis'
  }/${resourceGroupAndVersion}/${resourceNamePlural}`.toLowerCase();

  const doesExist = !!resourceIdList.includes(resourcePathId);

  return doesExist;
};

export const doesUserHavePermission = (
  permissions = ['list'],
  resource: { resourceGroupAndVersion: string; resourceKind: string },
  permissionSet: PermissionSetState,
) => {
  const { resourceGroupAndVersion, resourceKind } = resource;

  const resourceKindPlural = pluralize(resourceKind).toLowerCase();
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

const getResourceGroup = (resourceGroupAndVersion: string) => {
  // native resources don't have resourceGroup
  if (resourceGroupAndVersion === 'v1') return '';
  return resourceGroupAndVersion.split('/')[0];
};
