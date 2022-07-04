import pluralize from 'pluralize';
import { resources } from 'resources';

export function getResourceDefs(defType, t, context, key) {
  return resources
    .filter(resource => resource.resourceType === defType)
    .map(resource => {
      return resource[key](t, context);
    })
    .flat();
}

export function getPerResourceDefs(defType, t, context) {
  return Object.fromEntries(
    resources
      .filter(resource => !!resource[defType])
      .map(({ resourceType, resourceGraphConfig }) => {
        const kind = pluralize(resourceType, 1);
        const value = resourceGraphConfig(t, context);
        return [kind, value];
      }),
  );
}
