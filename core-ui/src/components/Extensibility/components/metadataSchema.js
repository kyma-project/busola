export const METADATA_SCHEMA = {
  properties: {
    name: {
      type: 'string',
    },
    labels: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      widget: 'AdditionalProperties',
    },
    annotations: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      widget: 'AdditionalProperties',
    },
  },
  type: 'object',
};
