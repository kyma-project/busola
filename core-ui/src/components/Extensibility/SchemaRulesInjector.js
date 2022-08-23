import React from 'react';
import { merge, initial, last } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { List, OrderedMap, fromJS } from 'immutable';

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

  const extractRules = ({ path, ...ruleDef }, parentPath = []) => {
    const fullPath = path
      ? [
          ...parentPath,
          ...(Array.isArray(path)
            ? path
            : path?.replace(/\[]/g, '.[]')?.split('.') || []),
        ]
      : [...parentPath, '*'];

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
                path: myPath,
                children: [],
              }
            : {
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
  varsStore,
  ...props
}) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const path = storeKeys.map(item => (typeof item === 'number' ? '[]' : item));

  const { simple, advanced, path: myPath, children: childRules, ...itemRule } =
    schema.get('schemaRule') ?? rootRule;

  if (schema.get('var')) {
    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
        schema={schema}
        value="blah"
        onChange={e => {
          // TODO
        }}
        storeKeys={fromJS([schema.get('var')])}
      />
    );
  }

  let newSchema = schema.mergeDeep(itemRule);
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
      // varsStore={varsStore}
    />
  );
}
