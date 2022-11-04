export function prepareRules(schemaRules, editMode, t) {
  const PREDEFINED_PATHS = [
    'metadata.name',
    'metadata.labels',
    'metadata.annotations',
  ];

  const defaultNameField = {
    path: 'metadata.name',
    simple: true,
    widget: 'Name',
    required: true,
    editMode,
    inputInfo: t('common.tooltips.k8s-name-input'),
    extraPaths: ['metadata.labels["app.kubernetes.io/name"]'],
  };
  const defaultLabelsField = {
    path: 'metadata.labels',
    widget: 'KeyValuePair',
    defaultExpanded: false,
  };
  const defaultAnnotationsField = {
    path: 'metadata.annotations',
    widget: 'KeyValuePair',
    defaultExpanded: false,
  };

  const nameField = {
    ...defaultNameField,
    ...schemaRules.find(r => r.path === 'metadata.name'),
  };
  const labelsField = {
    ...defaultLabelsField,
    ...schemaRules.find(r => r.path === 'metadata.labels'),
  };
  const annotationsField = {
    ...defaultAnnotationsField,
    ...schemaRules.find(r => r.path === 'metadata.annotations'),
  };

  return [
    nameField,
    labelsField,
    annotationsField,
    ...schemaRules.filter(r => !PREDEFINED_PATHS.includes(r.path)),
  ];
}
