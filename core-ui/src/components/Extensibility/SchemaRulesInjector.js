import React from 'react';
import { merge, initial, last } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { List } from 'immutable';
import { jsonataWrapper } from './jsonataWrapper';

const byPath = a => b => JSON.stringify(b.path) === JSON.stringify(a);

// JS findLast doesn't work in firefox yet
const findLast = (rules = [], condition) => {
  const reversedRules = rules.reverse();
  return reversedRules.find(condition);
};

// fake an OrderedMap-like structure using List to allow for duplicate keys
const propertiesWrapper = src => ({
  map: cb => List(src?.map(([key, val]) => cb(val, key))),
});

export function prepareSchemaRules(ruleDefs) {
  const rules = [{ path: [], children: [] }];

  const addRule = rule => {
    rules.push(rule);
    const parentPath = initial(rule.path);
    const lastParent = findLast(rules, byPath(parentPath));
    if (lastParent) {
      lastParent.children.push(rule);
    }
  };

  const extractRules = ({ path, ...ruleDef }, parentPath = []) => {
    const fullPath = [
      ...parentPath,
      ...(Array.isArray(path)
        ? path
        : path?.replace(/\[]/g, '.[]')?.split('.') || []),
    ].filter(segment => !!segment);

    initial(fullPath).reduce((acc, step) => {
      const myPath = [...acc, step];
      const lastRule = findLast(rules, byPath(myPath));
      if (!lastRule) {
        addRule({
          path: myPath,
          auto: true,
          children: [],
        });
      }
      return myPath;
    }, []);

    const lastRule = findLast(rules, byPath(fullPath));
    if (!lastRule || !lastRule.auto) {
      addRule({
        ...ruleDef,
        path: fullPath,
        children: [],
      });
    } else {
      merge(lastRule, ruleDef);
      lastRule.auto = false;
      lastRule.children = [];
    }
    ruleDef.children?.forEach(subDef => extractRules(subDef, fullPath));
  };

  ruleDefs.forEach(subDef => extractRules(subDef));

  return rules;
}

export function SchemaRulesInjector({
  schema,
  storeKeys,
  currentPluginIndex,
  schemaRules,
  resource,
  ...props
}) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const path = storeKeys.map(item => (typeof item === 'number' ? '[]' : item));

  const { simple, advanced, path: myPath, children: childRules, ...itemRule } =
    schema.get('schemaRule') ?? schemaRules.find(byPath(path)) ?? {};

  let newSchema = schema.mergeDeep(itemRule);
  if (schema.get('properties')) {
    const newProperties = childRules
      ?.map(rule => {
        const propertyKey = last(rule.path);
        const property = newSchema
          .get('properties')
          .get(propertyKey)
          ?.set('schemaRule', rule);

        let lastArrayItem;
        let lastArrayIndex = storeKeys
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
          const visible = jsonataWrapper(rule.visibility).evaluate(resource, {
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
      resource={resource}
    />
  );
}
