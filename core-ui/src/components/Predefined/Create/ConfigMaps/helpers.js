import { getResourceDefs } from 'shared/helpers/getResourceDefs';

export const getConfigMapDefs = (t, context) =>
  getResourceDefs('configMaps', t, context);

export function createConfigMapTemplate(namespace) {
  return {
    metadata: {
      namespace,
    },
    data: {},
  };
}

export function createPresets(defs, namespaceId, t) {
  if (!defs.length) {
    return null;
  }

  return [
    {
      name: t('config-maps.presets.default'),
      value: createConfigMapTemplate(namespaceId),
    },
    ...defs.map(({ name, ...value }) => ({
      name,
      value,
    })),
  ];
}
