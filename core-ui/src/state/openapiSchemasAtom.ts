import { atom, RecoilState } from 'recoil';

type OpenApiSchemasState = {
  areSchemasComputed: boolean;
  schemasError: null | object;
};

const defaultValue = {
  areSchemasComputed: false,
  schemasError: null,
};

export const openapiSchemasState: RecoilState<OpenApiSchemasState> = atom({
  key: 'openapiSchemasState',
  default: defaultValue,
});
