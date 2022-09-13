import React, { createContext, useState } from 'react';
import * as jp from 'jsonpath';

export const VarStoreContext = createContext({
  vars: {},
  setVar: () => {},
});

export function VarStoreContextProvider({ children }) {
  const [vars, setVarStore] = useState({});

  const setVar = (path, value) => {
    const oldVal = jp.value(vars, path);
    if (typeof value !== 'undefined' && value !== oldVal) {
      jp.value(vars, path, value);
      setVarStore({ ...vars });
    }
  };

  return (
    <VarStoreContext.Provider value={{ vars, setVar }}>
      {children}
    </VarStoreContext.Provider>
  );
}
