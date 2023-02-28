import { prettifyKind } from 'shared/utils/helpers';
import pluralize from 'pluralize';
import { getLatestVersion } from 'components/Extensibility/migration';
import { EXTENSION_VERSION_LABEL } from './constants';
import jsyaml from 'js-yaml';

export const SECTIONS = [
  'general',
  'form',
  'list',
  'details',
  'dataSources',
  'translations',
];

function extractFirstLevelProperties(crd) {
  const filterSimpleProps = ([, property]) =>
    property.type !== 'object' && property.type !== 'array';

  const spec = crd.spec.versions.find(v => v.storage).schema?.openAPIV3Schema
    ?.properties?.spec;

  const firstLevelProperties = spec?.properties || {};
  const requiredProperties = spec?.required || [];

  return Object.entries(firstLevelProperties)
    .filter(filterSimpleProps)
    .map(([name, property]) => ({
      path: `spec.${name}`,
      type: property.type,
      name,
      isSelected: true,
      required: requiredProperties.includes(name),
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
    general: {
      resource: {
        kind: crd.spec.names.kind,
        group: crd.spec.group,
        version: version.name,
      },
      name: pluralize(prettifyKind(crd.spec.names.kind)),
      category: t('custom-resources.title'),
      urlPath: crd.spec.names.plural,
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
            : [
                {
                  name: 'Created at',
                  isSelected: true,
                  source: 'metadata.creationTimestamp',
                  type: 'date',
                },
              ],
        },
        { source: 'spec', widget: 'CodeViewer' },
      ],
    },
    translations: {
      en: {
        'metadata.annotations': 'Annotations',
        'metadata.labels': 'Labels',
        ...(additionalValueColumns.length
          ? { 'metadata.creationTimestamp': 'Created at' }
          : {}),
      },
    },
  };
}

export function createConfigmap(crd, data) {
  const filterViewProps = arr =>
    (arr ?? [])
      .filter(e => e.isSelected)
      .map(e => ({
        name: e.name,
        source: e.path,
      }));

  data.list = filterViewProps(data.list);
  data.details.body[0].children = filterViewProps(
    data.details.body[0].children,
  );
  if (!data.details.body[0].children.length) {
    data.details.body.splice(0, 1);
  }

  data.form = (data.form ?? [])
    .filter(e => e.isSelected)
    .map(e => ({ simple: true, path: e.path, required: e.required }));

  return {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    metadata: {
      name: crd.metadata.name,
      namespace: 'kube-public',
      labels: {
        'app.kubernetes.io/name': crd.metadata.name,
        'busola.io/extension': 'resource',
        [EXTENSION_VERSION_LABEL]: getLatestVersion(),
      },
    },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        jsyaml.dump(value, null, 2),
      ]),
    ),
  };
}

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
