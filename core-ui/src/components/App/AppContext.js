import { createContext } from 'react';

export const AppContext = createContext({
  schemaInfo: {
    areSchemasComputed: false,
    schemasError: null,
  },
});
