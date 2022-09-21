import React, { createContext, useState } from 'react';
import * as jp from 'jsonpath';

export const VarStoreContext = createContext({
  vars: {},
  setVar: () => {},
  setVars: () => {},
});

export function VarStoreContextProvider({ children }) {
  const [vars, setVars] = useState({});

  const setVar = (path, value) => {
    const oldVal = jp.value(vars, path);
    if (typeof value !== 'undefined' && value !== oldVal) {
      jp.value(vars, path, value);
      setVars({ ...vars });
    }
  };

  return (
    <VarStoreContext.Provider value={{ vars, setVar, setVars }}>
      {children}
    </VarStoreContext.Provider>
  );
}
