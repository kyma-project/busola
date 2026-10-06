import {
  createContext,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import jp from 'jsonpath';

export const VarStoreContext = createContext<{
  vars: Record<string, any>;
  setVar: (path: string, value: any) => void;
  setVars: (value: SetStateAction<Record<string, any>>) => void;
}>({
  vars: {},
  setVar: () => {},
  setVars: () => {},
});

export function VarStoreContextProvider({ children }: { children: ReactNode }) {
  const [vars, setVars] = useState({});

  const setVar = useCallback(
    (path: string, value: any) => {
      try {
        const oldVal = jp.value(vars, path);
        if (typeof value !== 'undefined' && value !== oldVal) {
          jp.value(vars, path, value);
          setVars({ ...vars });
        }
      } catch {
        return;
      }
    },
    [vars],
  );

  const contextValue = useMemo(
    () => ({ vars, setVar, setVars }),
    [vars, setVar],
  );

  return (
    <VarStoreContext.Provider value={contextValue}>
      {children}
    </VarStoreContext.Provider>
  );
}
