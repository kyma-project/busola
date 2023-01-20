import pluralize from 'pluralize';
import { resources } from 'resources';

export function getPerResourceDefs(defType, t, features) {
  return Object.fromEntries(
    resources
      .filter(resource => !!resource[defType])
      .map(resource => {
        const kind = pluralize(resource.resourceType, 1);
        const value = resource[defType](t, features);
        return [kind, value];
      }),
  );
}
