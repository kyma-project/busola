export const METADATA_SCHEMA = {
  properties: {
    name: {
      type: 'string',
      widget: 'Name',
      extraPaths: [['metadata', 'labels', 'app.kubernetes.io/name']],
    },
    labels: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      widget: 'KeyValuePair',
    },
    annotations: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      widget: 'KeyValuePair',
    },
  },
  type: 'object',
};
