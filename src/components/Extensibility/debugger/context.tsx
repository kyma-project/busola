import React, { createContext } from 'react';

type DebugContextEnv = {
  [debugId: string]: {
    resource: any;
    scope: any;
    arrayItems: any;
    queries: {
      [key: string]: {
        query: string;
        value: any;
        env: any;
      };
    };
  };
};

type DebugContextProps = {
  env: { current: DebugContextEnv };
  uuid: string;
  init: (
    debugId: string,
    {
      resource,
      scope,
      arrayItems,
    }: { resource: any; scope: any; arrayItems: any },
  ) => void;
  setQuery: (debugId: string, datapoint: string, data: any) => void;
  updateQuery: (debugId: string, datapoint: string, data: any) => void;
};

export const DebugContext = createContext<DebugContextProps>({
  env: {
    current: {},
  },
  uuid: '',
  init: () => 0,
  setQuery: () => null,
  updateQuery: () => null,
});
