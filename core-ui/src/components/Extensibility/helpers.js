import pluralize from 'pluralize';

export function createTemplate(api, namespace, scope) {
  const template = {
    apiVersion: `${api.group}/${api.version}`,
    kind: pluralize(api.kind, 1),
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
    spec: {},
  };
  if (namespace && scope === 'namespace')
    template.metadata.namespace = namespace;
  return template;
}
