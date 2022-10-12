import { atom, RecoilState } from 'recoil';

type OpenApiSchemasState = {
  areSchemasComputed: boolean;
  schemasError: null | Error;
};

const defaultValue = {
  areSchemasComputed: false,
  schemasError: null,
};

export const openapiSchemasState: RecoilState<OpenApiSchemasState> = atom<
  OpenApiSchemasState
>({
  key: 'openapiSchemasState',
  default: defaultValue,
});
