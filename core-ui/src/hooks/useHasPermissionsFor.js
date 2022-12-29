import pluralize from 'pluralize';
import { useRecoilValue } from 'recoil';
import { permissionSetsSelector } from 'state/permissionSetsSelector';

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

export function useHasPermissionsFor(queries) {
  const permissionSet = useRecoilValue(permissionSetsSelector);

  return queries.map(([apiGroup, resourceType, verbs]) =>
    hasPermissionsFor(apiGroup, resourceType, permissionSet, verbs),
  );
}
