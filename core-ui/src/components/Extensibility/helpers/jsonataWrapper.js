import jsonata from 'jsonata';
import { isEqual } from 'lodash';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

export function jsonataWrapper(expression) {
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
    return ReadableCreationTimestamp((timestamp = { timestamp }));
  });

  return exp;
}
