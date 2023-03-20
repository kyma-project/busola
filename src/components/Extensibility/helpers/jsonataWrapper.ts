import { useRecoilValue } from 'recoil';
import jsonata from 'jsonata';
import { isEqual } from 'lodash';
import { getReadableTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import { permissionSetsSelector } from 'state/permissionSetsSelector';

export function jsonataWrapper(expression: string) {
  const exp = jsonata(expression);

  exp.registerFunction('matchByLabelSelector', (pod, labels) => {
    if (!pod.metadata?.labels || !labels) return false;

    const podLabels = Object?.entries(pod.metadata?.labels);
    const resourceLabels = Object?.entries(labels);
    return resourceLabels.every(resLabel =>
      podLabels.some(podLabel => isEqual(resLabel, podLabel)),
    );
  });

  exp.registerFunction(
    'matchEvents',
    (resource, resourceKind, resourceName) => {
      return (
        resource?.involvedObject?.name === resourceName &&
        resource?.involvedObject?.kind === resourceKind
      );
    },
  );

  exp.registerFunction('compareStrings', (first, second) => {
    return first?.localeCompare(second) ?? 1;
  });

  exp.registerFunction('readableTimestamp', timestamp => {
    return getReadableTimestamp(timestamp);
  });

  exp.registerFunction('canI', (resourceGroupAndVersion, resourceKind) => {
    const permissionSet = useRecoilValue(permissionSetsSelector);

    const isPermitted = doesUserHavePermission(
      ['list'],
      { resourceGroupAndVersion, resourceKind: resourceKind.toLowerCase() },
      permissionSet,
    );

    return isPermitted;
  });
  return exp;
}
