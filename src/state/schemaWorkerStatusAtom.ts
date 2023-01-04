import { atom, RecoilState } from 'recoil';

type SchemaWorkerStatusState = {
  areSchemasComputed: boolean;
  schemasError: null | Error;
};

const defaultValue = {
  areSchemasComputed: false,
  schemasError: null,
};

export const schemaWorkerStatusState: RecoilState<SchemaWorkerStatusState> = atom<
  SchemaWorkerStatusState
>({
  key: 'schemaWorkerStatusState',
  default: defaultValue,
});
