export function createConfigMapTemplate(namespace) {
  return {
    apiVersion: 'v1',
    kind: 'ConfigMap',
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
      name: t('common.labels.default-preset'),
      value: createConfigMapTemplate(namespaceId),
    },
    ...defs.map(({ name, ...value }) => ({
      name,
      value,
    })),
  ];
}
