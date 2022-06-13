import { prettifyNamePlural } from 'shared/utils/helpers';
import pluralize from 'pluralize';

export function createExtensibilityTemplate(crd, t) {
  const version = crd.spec.versions.find(v => v.storage);
  return {
    name: pluralize(prettifyNamePlural(null, crd.spec.names.kind)),
    resource: {
      kind: crd.spec.names.kind,
      group: crd.spec.group,
      version: version.name,
    },
    navigation: {
      path: crd.spec.names.plural,
      scope: crd.spec.scope === 'Namespaced' ? 'namespace' : 'cluster',
      category: t('custom-resources.title'),
    },
    form: {},
    list: [],
    details: {
      header: [],
      body: [{ path: 'spec', widget: 'CodeViewer' }],
    },
    schema: version.schema.openAPIV3Schema,
    translations: {},
  };
}

export function createConfigmap(crd, cmData) {
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
      Object.entries(cmData).map(([key, value]) => [
        key,
        JSON.stringify(value, null, 2),
      ]),
    ),
  };
}
