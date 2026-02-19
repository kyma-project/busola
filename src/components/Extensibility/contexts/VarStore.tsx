import { createContext, ReactNode, SetStateAction, useState } from 'react';
import jp from 'jsonpath';

export const VarStoreContext = createContext({
  vars: {},
  setVar: (() => {}) as (path: string, value: any) => void,
  setVars: (() => {}) as (value: SetStateAction<Record<string, any>>) => void,
});

export function VarStoreContextProvider({ children }: { children: ReactNode }) {
  const [vars, setVars] = useState({});

  const setVar = (path: string, value: any) => {
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
