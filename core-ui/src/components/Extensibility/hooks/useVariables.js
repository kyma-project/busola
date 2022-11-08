import { useContext, useState } from 'react';
import { last, initial, tail, trim } from 'lodash';
import * as jp from 'jsonpath';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { VarStoreContext } from '../contexts/VarStore';

const pathToJP = path =>
  '$' +
  trim(path, '.')
    .split(/\./)
    .map(item => `["${item}"]`)
    .join('');

const applyDefaults = (def, val) => {
  if (typeof val !== 'undefined') {
    return val;
  } else if (def.type === 'boolean') {
    return false;
  } else if (def.type === 'string') {
    return '';
  } else if (def.type === 'number') {
    return 0;
  }
};

export function extractVariables(varStore, vars, indexes) {
  if (!indexes?.length) {
    return varStore;
  }

  return vars
    ? Object.fromEntries(
        vars.map(varName => [
          varName,
          indexes.reduce((acc, index) => acc?.[index], varStore[varName]),
        ]),
      )
    : {};
}

export function useVariables() {
  const { vars, setVar, setVars } = useContext(VarStoreContext);
  const [defs, setDefs] = useState({});
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
    const getLevel = (rules, path = '') =>
      rules.forEach(rule => {
        const rulePath = path ? `${path}.${rule.path}` : rule.path;
        if (rule.var) {
          defs[rule.var] = {
            ...rule,
            path,
          };
        } else if (rule.children) {
          getLevel(rule.children, rulePath);
        }
      });

    getLevel(rules);
    setDefs({ ...defs });
  };

  const resetVars = () => {
    Object.values(defs)
      .filter(def => def.dynamicValue)
      .forEach(def => {
        delete vars[def.var];
      });
    setVars({ ...vars });
  };

  const readVars = resource => {
    const readVar = (def, path, base = resource) => {
      if (path.length) {
        return (jp.value(base, pathToJP(path[0])) ?? []).map(item =>
          applyDefaults(def, readVar(def, tail(path), item)),
        );
      } else if (def.defaultValue) {
        return def.defaultValue;
      } else if (def.dynamicValue) {
        return jsonataWrapper(def.dynamicValue).evaluate(resource, {
          item: base,
          ...dataSourceFetchers,
        });
      }
    };

    Object.values(defs)
      .filter(def => typeof vars[def.var] === 'undefined')
      .forEach(def => {
        const pureVal = readVar(def, initial(def.path.split(/\[\]\.?/)));
        vars[def.var] = applyDefaults(def, pureVal);
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
