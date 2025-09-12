import pluralize from 'pluralize';
import { useAtomValue } from 'jotai';
import { permissionSetsAtom } from 'state/permissionSetsAtom';

export function hasPermissionsFor(
  apiGroup,
  resourceType,
  permissionSet,
  verbs = [],
) {
  const permissionsForApiGroup = permissionSet.filter(
    (p) => p.apiGroups.includes(apiGroup) || p.apiGroups[0] === '*',
  );
  const matchingPermission = permissionsForApiGroup.find((p) =>
    p.resources.includes(pluralize(resourceType)),
  );
  const wildcardPermission = permissionsForApiGroup.find(
    (p) => p.resources[0] === '*',
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
  const permissionSet = useAtomValue(permissionSetsAtom);

  return queries.map(([apiGroup, resourceType, verbs]) =>
    hasPermissionsFor(apiGroup, resourceType, permissionSet, verbs),
  );
}
