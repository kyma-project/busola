import { createContext, useContext } from 'react';
import { last } from 'lodash';

export const VarStoreContext = createContext({
  vars: {},
  setVar: () => {},
});

export function extractVariables(varStore, vars, indexes) {
  if (!indexes?.length) {
    return varStore;
  }

  return Object.fromEntries(
    vars.map(varName => [
      varName,
      indexes.reduce((acc, index) => acc?.[index], varStore[varName]),
    ]),
  );
}

export function useVariables() {
  const { vars, setVar } = useContext(VarStoreContext);
  const itemVars = (resource, names, storeKeys) => {
    let lastArrayItem;
    let lastArrayIndex = storeKeys
      .toArray()
      .findLastIndex(item => typeof item === 'number');

    if (lastArrayIndex > 0) {
      const lastArrayStoreKeys = storeKeys.slice(0, lastArrayIndex + 1);

      lastArrayItem = lastArrayStoreKeys
        .toArray()
        .reduce((item, key) => item?.[key], resource);
    }

    const indexes = storeKeys
      .filter(item => typeof item === 'number')
      .toArray();

    const index = last(indexes);

    const localVars = extractVariables(vars, names, indexes);

    return {
      ...vars,
      ...localVars,
      vars,
      index,
      indexes,
      item: lastArrayItem,
    };
  };
  return {
    vars,
    setVar,
    itemVars,
  };
}
