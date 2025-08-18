import { atom } from 'jotai';

type SchemaWorkerStatusState = {
  areSchemasComputed: boolean;
  schemasError: null | Error;
};

const defaultValue = {
  areSchemasComputed: false,
  schemasError: null,
};

export const schemaWorkerStatusState = atom<SchemaWorkerStatusState>(
  defaultValue,
);
schemaWorkerStatusState.debugLabel = 'schemaWorkerStatusState';
