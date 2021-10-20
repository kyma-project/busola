import * as components from 'components/Predefined/Create';

export function getResourceDefs(defType, t, context) {
  return Object.values(components)
    .filter(component => component[defType])
    .map(component => component[defType](t, context))
    .flat();
}
