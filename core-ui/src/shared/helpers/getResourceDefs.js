import pluralize from 'pluralize';
import { resources } from 'resources';

export function getResourceDefs(defType, t, context) {
  return Object.values(resources)
    .filter(resource => resource[defType])
    .map(resource => resource[defType](t, context))
    .flat();
}

export function getPerResourceDefs(defType, t, context) {
  return Object.fromEntries(
    Object.entries(resources)
      .filter(([, resource]) => resource[defType])
      .map(([resourceName, resource]) => {
        const kind = pluralize(resourceName, 1);
        const value = resource[defType](t, context);
        return [kind, value];
      }),
  );
}
