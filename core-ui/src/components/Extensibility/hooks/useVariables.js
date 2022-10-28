import { useContext, useState } from 'react';
import { last, initial, tail, trim } from 'lodash';
import * as jp from 'jsonpath';

import { useJsonata } from './useJsonata';
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
  const jsonata = useJsonata({});
  const [defs, setDefs] = useState({});

  const itemVars = (resource, names, storeKeys) => {
    const indexes = storeKeys
      .toArray()
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => typeof item === 'number')
      .map(({ item, index }) => index);

    const items = indexes.map(({ item, index }) =>
      storeKeys
        .slice(0, index + 1)
        .toArray()
        .reduce((item, key) => item?.[key], resource),
    );

    const item = last(items) || resource;
    const index = last(indexes);

    const localVars = extractVariables(vars, names, indexes);

    return {
      ...vars,
      ...localVars,
      vars,
      item,
      items,
      index,
      indexes,
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
    const readVar = async (def, path, base = resource) => {
      if (path.length) {
        const value = jp.value(base, pathToJP(path[0])) ?? [];
        const promises = value.map(item => readVar(def, tail(path)));
        return Promise.all(promises).then(vars =>
          vars.map(v => applyDefaults(def, v)),
        );
      } else if (def.defaultValue) {
        return def.defaultValue;
      } else if (def.dynamicValue) {
        return jsonata.async(def.dynamicValue, {
          resource,
          item: base,
        });
      } else {
        return '';
      }
    };

    const promises = Object.values(defs)
      .filter(def => typeof vars[def.var] === 'undefined')
      .map(def => {
        return Promise.any([
          readVar(def, initial(def.path.split(/\[\]\.?/))),
        ]).then(([val, err]) => {
          const newval = applyDefaults(def, val);
          return [def, newval];
        });
      });

    Promise.all(promises).then(values => {
      values.forEach(([def, val]) => (vars[def.var] = applyDefaults(def, val)));
      setVars({ ...vars });
    });
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
