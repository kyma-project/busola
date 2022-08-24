import React from 'react';
import { merge, initial, last } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { List, OrderedMap, fromJS } from 'immutable';
import * as jp from 'jsonpath';

import { jsonataWrapper } from './jsonataWrapper';

const eqPath = (a, b) => JSON.stringify(b) === JSON.stringify(a);
const byPath = a => b => eqPath(b.path, a);

// JS findLast doesn't work in firefox yet
const findLast = (rules = [], condition) => {
  const reversedRules = rules.reverse().filter(rule => !rule.var);
  return reversedRules.find(condition);
};

// fake an OrderedMap-like structure using List to allow for duplicate keys
const propertiesWrapper = src => ({
  map: cb => List(src?.map(([key, val]) => cb(val, key))),
});

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

    fullPath.reduce((acc, step, index) => {
      const myPath = [...acc, step];
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
              }
            : {
                var: varName,
                path: myPath,
                children: [],
              };
        stackTop.children.push(rule);
        stack.push(rule);
      }
      return myPath;
    }, []);

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

  const path = storeKeys.map(item => (typeof item === 'number' ? '[]' : item));

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
          .findLastIndex(item => typeof item === 'number');

        if (lastArrayIndex > 0) {
          const lastArrayStoreKeys = storeKeys.slice(0, lastArrayIndex + 1);

          lastArrayItem = lastArrayStoreKeys
            .toArray()
            .reduce((item, key) => item?.[key], resource);
        }

        if (rule.visibility) {
          const visible = jsonataWrapper(rule.visibility).evaluate(resource, {
            ...varStore,
            item: lastArrayItem,
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
