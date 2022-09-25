import React from 'react';
import { last } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { List, fromJS } from 'immutable';

// fake an OrderedMap-like structure using List to allow for duplicate keys
const propertiesWrapper = src => ({
  map: cb => List(src?.map(([key, val]) => cb(val, key))),
});

export function SchemaRulesInjector({
  schema,
  // storeKeys,
  currentPluginIndex,
  rootRule,
  value,
  resource,
  ...props
}) {
  // console.log('SchemaRulesInjector', props.storeKeys.join('.'));
  // console.log('props', props);

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const { simple, advanced, path: myPath, children: childRules, ...itemRule } =
    schema.get('schemaRule') ?? rootRule;

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
      value={value}
      resource={resource}
    />
  );
}
