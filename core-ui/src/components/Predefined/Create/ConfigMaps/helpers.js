import * as components from '../';

export function getDefs(defType, t, context) {
  return Object.values(components)
    .filter(component => component[defType])
    .map(component => component[defType](t, context))
    .flat();
}

export const getConfigMapDefs = (t, context) =>
  getDefs('configMaps', t, context);

export function createConfigMapTemplate(namespace) {
  return {
    metadata: {
      namespace,
    },
    data: {},
  };
}

export function createPresets(defs, namespace, t) {}
