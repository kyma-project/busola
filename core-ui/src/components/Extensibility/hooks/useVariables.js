import { useContext, useState } from 'react';
import { last } from 'lodash';

import { VarStoreContext } from '../contexts/VarStore';

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
  const { vars, setVar, setVars } = useContext(VarStoreContext);
  const { defs, setDefs } = useState({});
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

  const prepareVars = rules => {
    const varDefs = {};
    const getLevel = (rules, path = '') => {
      rules.forEach(rule => {
        const rulePath = path ? `${path}.${rule.path}` : rule.path;
        if (rule.var) {
          varDefs[rule.var] = {
            ...rule,
            path,
            depth: path.matchAll(/\[\]/).length,
          };
        } else if (rule.children) {
          getLevel(rule.children, rulePath);
        }
      });
    };
    setDefs(getLevel(rules));
  };

  const resetVars = () => {
    Object.values(defs)
      .filter(def => def.dynamicValue)
      .forEach(def => {
        delete vars[def.var];
        setVars({ ...vars });
      });
  };

  const readVars = resource => {
    Object.values(defs)
      .filter(def => typeof vars[def.var] === 'undefined')
      .filter(def => def.dynamicValue)
      .forEach(() => {
        // TODO
      });
    setVars({ ...vars });
  };

  return {
    vars,
    setVar,
    itemVars,
    prepareVars,
    readVars,
    resetVars,
  };
}
