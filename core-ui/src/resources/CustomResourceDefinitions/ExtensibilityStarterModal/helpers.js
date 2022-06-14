import { prettifyKind } from 'shared/utils/helpers';
import pluralize from 'pluralize';

function extractFirstLevelProperties(crd) {
  const filterSimpleProps = ([, property]) =>
    property.type !== 'object' && property.type !== 'array';

  const firstLevelProperties =
    crd.spec.versions.find(v => v.storage).schema?.openAPIV3Schema?.properties
      ?.spec?.properties || {};

  return Object.entries(firstLevelProperties)
    .filter(filterSimpleProps)
    .map(([name, property]) => ({
      path: `spec.${name}`,
      type: property.type,
      name: name,
      isSelected: true,
    }));
}

function extractAdditionalPrinterColumns(crd) {
  const version = crd.spec.versions.find(v => v.storage);

  return (version.additionalPrinterColumns || []).map(apc => ({
    path: apc.jsonPath.substring(1), // remove trailing '.'
    type: apc.type,
    name: apc.name,
    isSelected: true,
  }));
}

function isStatusMaybe({ name }) {
  return name.toLowerCase() === 'status' || name.toLowerCase() === 'phase';
}

export function extractValueColumns(crd) {
  const firstLevelPropertiesColumns = extractFirstLevelProperties(crd);
  const additionalPrinterColumns = extractAdditionalPrinterColumns(crd);

  const inferWidgets = c => ({
    ...c,
    ...(isStatusMaybe(c) ? { widget: 'Badge' } : {}),
  });

  return [...firstLevelPropertiesColumns, ...additionalPrinterColumns].map(
    inferWidgets,
  );
}

export function createExtensibilityTemplate(crd, t) {
  const version = crd.spec.versions.find(v => v.storage);
  const additionalValueColumns = extractValueColumns(crd);

  const possibleStatusColumn = additionalValueColumns.find(isStatusMaybe);
  return {
    resource: {
      kind: crd.spec.names.kind,
      group: crd.spec.group,
      version: version.name,
    },
    navigation: {
      path: crd.spec.names.plural,
      scope: crd.spec.scope === 'Namespaced' ? 'namespace' : 'cluster',
    },
    form: extractFirstLevelProperties(crd),
    list: additionalValueColumns,
    details: {
      header: possibleStatusColumn ? [possibleStatusColumn] : [],
      body: [
        {
          name: 'Summary',
          widget: 'Panel',
          children: additionalValueColumns.length
            ? extractValueColumns(crd) // create a copy
            : [{ path: 'metadata.creationTimestamp' }],
        },
        { path: 'spec', widget: 'CodeViewer' },
      ],
    },
    // turns out the openAPIV3Schema is not required
    schema: version.schema?.openAPIV3Schema || {},
    translations: {
      en: {
        name: pluralize(prettifyKind(crd.spec.names.kind)),
        category: t('custom-resources.title'),
        ...(additionalValueColumns.length
          ? { 'metadata.creationTimestamp': 'Created at' }
          : {}),
      },
    },
  };
}

export function createConfigmap(crd, data) {
  const filterSelected = arr =>
    arr
      .filter(e => e.isSelected)
      .map(e => {
        delete e.isSelected;
        return e;
      });

  data.list = filterSelected(data.list);
  data.details.body[0].children = filterSelected(data.details.body[0].children);
  data.form = filterSelected(data.form);

  return {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      name: crd.metadata.name,
      namespace: 'kube-public',
      labels: {
        'app.kubernetes.io/name': crd.metadata.name,
        'busola.io/extension': 'resource',
      },
    },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        JSON.stringify(value, null, 2),
      ]),
    ),
  };
}
