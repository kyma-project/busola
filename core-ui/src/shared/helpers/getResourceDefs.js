import pluralize from 'pluralize';
import { resources } from 'resources';

export function getResourceDefs(defType, t, context) {
  console.log('getResourceDefs', { defType });
  return Object.values(resources)
    .filter(resource => resource[defType])
    .map(resource => resource[defType](t, context))
    .flat();
}

export function getPerResourceDefs(defType, t, context) {
  console.log('getPerResourceDefs', { defType });
  console.log(
    Object.fromEntries(
      Object.entries(resources)
        .filter(([, resource]) => resource[defType])
        .map(([resourceName, resource]) => {
          // ResourcesCreate -> Resource
          // const kind = pluralize(resourceName.replace('Create', ''), 1);
          const kind = pluralize(resourceName, 1);
          const value = resource[defType](t, context);
          return [kind, value];
        }),
    ),
  );
  return Object.fromEntries(
    Object.entries(resources)
      .filter(([, resource]) => resource[defType])
      .map(([resourceName, resource]) => {
        // ResourcesCreate -> Resource
        // const kind = pluralize(resourceName.replace('Create', ''), 1);
        const kind = pluralize(resourceName, 1);
        const value = resource[defType](t, context);
        return [kind, value];
      }),
  );
}
