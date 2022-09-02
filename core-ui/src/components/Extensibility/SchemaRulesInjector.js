import React from 'react';
import { last } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { List, fromJS } from 'immutable';
import * as jp from 'jsonpath';

import { jsonataWrapper } from './jsonataWrapper';

const eqPath = (a, b) => JSON.stringify(b) === JSON.stringify(a);

// fake an OrderedMap-like structure using List to allow for duplicate keys
const propertiesWrapper = src => ({
  map: cb => List(src?.map(([key, val]) => cb(val, key))),
});

function extractVariables(varStore, vars, indexes) {
  if (!indexes?.length) {
    return {};
  }

  return Object.fromEntries(
    vars.map(varName => [
      varName,
      // `$${varName}`,
      indexes.reduce((acc, index) => acc?.[index], varStore[varName]),
    ]),
  );
}

export function prepareSchemaRules(ruleDefs) {
  const root = { path: [], children: [] };
  let stack = [root];

  const extractRules = (
    { path, var: varName, ...ruleDef },
    parentPath = [],
  ) => {
    const fullPath = (path
      ? [
          ...parentPath,
          ...(Array.isArray(path)
            ? path
            : path?.replace(/\[]/g, '.[]')?.split('.') || []),
        ]
      : [...parentPath, `$${varName}`]
    ).filter(item => !!item);

    let lastArrayIndex;
    fullPath.reduce((acc, step, index) => {
      const myPath = [...acc, step];
      if (step === '[]') lastArrayIndex = index;

      if (!stack[index + 1] || !eqPath(stack[index + 1].path, myPath)) {
        if (stack[index + 1]) {
          stack = stack.slice(0, index + 1);
        }

        const stackTop = stack[index];
        const rule =
          index === fullPath.length - 1
            ? {
                ...ruleDef,
                var: varName,
                path: myPath,
                children: [],
                itemVars: [],
              }
            : {
                var: varName,
                path: myPath,
                children: [],
                itemVars: [],
              };
        stackTop.children.push(rule);
        stack.push(rule);
      }
      return myPath;
    }, []);

    if (lastArrayIndex) {
      const lastArrayRule = stack[lastArrayIndex + 1];
      if (varName) lastArrayRule.itemVars.push(varName);
      stack
        .slice(lastArrayIndex + 1)
        .forEach(item => (item.itemVars = lastArrayRule.itemVars));
    }

    ruleDef.children?.forEach(subDef => extractRules(subDef, fullPath));
  };

  ruleDefs.forEach(subDef => extractRules(subDef));

  return root;
}

export function SchemaRulesInjector({
  schema,
  storeKeys,
  currentPluginIndex,
  rootRule,
  varStore,
  setVarStore,
  value,
  resource,
  ...props
}) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const varName = schema.get('var');
  const { simple, advanced, path: myPath, children: childRules, ...itemRule } =
    schema.get('schemaRule') ?? rootRule;

  if (varName) {
    const varSuffix = storeKeys
      .filter(item => typeof item === 'number')
      .map(item => `[${item}]`)
      .join('');
    const varPath = `$.${varName}${varSuffix}`;
    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
        schema={schema}
        value={jp.value(varStore, varPath)}
        onChange={e => {
          const newVal = e.data.value;
          const oldVal = jp.value(varStore, varPath);
          if (typeof newVal !== 'undefined' && newVal !== oldVal) {
            jp.value(varStore, varPath, newVal);
            setVarStore({ ...varStore });
          }
        }}
        storeKeys={fromJS([schema.get('var')])}
      />
    );
  }

  let newSchema = schema.mergeDeep(itemRule);

  if (schema.get('items')) {
    const newItems = schema.get('items').set('schemaRule', childRules[0]);
    newSchema = newSchema.set('items', newItems);
  }

  if (schema.get('properties')) {
    const newProperties = childRules
      ?.map(rule => {
        if (rule.var) {
          return ['', fromJS({ ...rule, schemaRule: rule })];
        }

        const propertyKey = last(rule.path);
        const property = newSchema
          .get('properties')
          .get(propertyKey)
          ?.set('schemaRule', rule);

        let lastArrayItem;
        const lastArrayIndex = storeKeys
          .toArray()
          // workaround for findLastIndex, Firefox isn't supporting it
          .reverse()
          .findIndex(item => typeof item === 'number');

        // workaround for findLastIndex, Firefox isn't supporting it
        lastArrayIndex = storeKeys.toArray().length - 1 - lastArrayIndex;

        if (lastArrayIndex > 0) {
          const lastArrayStoreKeys = storeKeys.slice(0, lastArrayIndex + 1);

          lastArrayItem = lastArrayStoreKeys
            .toArray()
            .reduce((item, key) => item?.[key], resource);
        }

        if (rule.visibility) {
          const indexes = storeKeys
            .filter(item => typeof item === 'number')
            .toArray();
          const index = last(indexes);
          const variables = extractVariables(varStore, rule.itemVars, indexes);
          const visible = jsonataWrapper(rule.visibility).evaluate(resource, {
            ...varStore,
            item: lastArrayItem,
            vars: variables,
            indexes,
            index,
          });
          if (!visible) return null;
        }
        return property ? [propertyKey, property] : null;
      })
      .filter(rule => !!rule);

    newSchema = newSchema.set('properties', propertiesWrapper(newProperties));
  }

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={newSchema}
      storeKeys={storeKeys}
      varStore={varStore}
      setVarStore={setVarStore}
      value={value}
      resource={resource}
    />
  );
}
