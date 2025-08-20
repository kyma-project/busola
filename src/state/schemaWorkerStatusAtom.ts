import { atom } from 'jotai';

type SchemaWorkerStatusState = {
  areSchemasComputed: boolean;
  schemasError: null | Error;
};

const defaultValue = {
  areSchemasComputed: false,
  schemasError: null,
};

export const schemaWorkerStatusAtom = atom<SchemaWorkerStatusState>(
  defaultValue,
);
schemaWorkerStatusAtom.debugLabel = 'schemaWorkerStatusAtom';
