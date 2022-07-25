import pluralize from 'pluralize';
import { getPerResourceDefs } from 'shared/helpers/getResourceDefs';
import { prettifyKind } from 'shared/utils/helpers';

export const getSecretDefs = (t, context) => {
  const defs = getPerResourceDefs('secrets', t, context);
  return Object.entries(defs)
    .map(([kind, secretsPresets]) =>
      secretsPresets.map(secretsPreset => ({
        ...secretsPreset,
        title:
          pluralize(prettifyKind(kind)) +
          ': ' +
          (secretsPreset.title || secretsPreset.type),
      })),
    )
    .flat();
};

export const mapObjectValues = (fn, obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

export function createSecretTemplate(namespaceId) {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    type: 'Opaque',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {},
      annotations: {},
    },
    data: {},
  };
}

export function createPresets(secretDefs, namespaceId, t) {
  return [
    {
      name: t('common.labels.default-preset'),
      value: createSecretTemplate(namespaceId),
    },
    ...secretDefs.map(({ title, name, type, data, ...value }) => ({
      name: title || name || type,
      value: {
        ...createSecretTemplate(namespaceId),
        ...value,
        name,
        type: type || 'Opaque',
        data: data?.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
      },
    })),
  ];
}
