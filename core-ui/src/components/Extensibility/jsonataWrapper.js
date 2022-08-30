import jsonata from 'jsonata';
import { isEqual } from 'lodash';

export function jsonataWrapper(expression) {
  const exp = jsonata(expression);

  exp.registerFunction('matchByLabelSelector', (pod, labels) => {
    if (!pod.metadata?.labels || !labels) return false;

    const podLabels = Object.entries(pod.metadata?.labels);
    const resourceLabels = Object.entries(labels);
    return resourceLabels.every(resLabel =>
      podLabels.some(podLabel => isEqual(resLabel, podLabel)),
    );
  });

  return exp;
}
