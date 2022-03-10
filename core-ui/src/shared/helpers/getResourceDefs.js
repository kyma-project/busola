import * as components from 'components/Predefined/Create';

export function getResourceDefs(defType, t, context) {
  return Object.values(components)
    .filter(component => component[defType])
    .map(component => component[defType](t, context))
    .flat();
}

export function getPerResourceDefs(defType, t, context) {
  return Object.fromEntries(
    Object.entries(components)
      .filter(([, component]) => component[defType])
      .map(([componentName, component]) => {
        // ResourcesCreate -> Resource
        const kind = componentName.replace('sCreate', '');
        const value = component[defType](t, context);
        return [kind, value];
      }),
  );
}
