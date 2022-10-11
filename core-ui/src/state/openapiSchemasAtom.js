import { atom } from 'recoil';

const defaultValue = {
  schemaInfo: {
    areSchemasComputed: false,
    schemasError: null,
  },
};

export const openapiSchemasState = atom({
  key: 'openapiSchemasState',
  default: defaultValue,
});
