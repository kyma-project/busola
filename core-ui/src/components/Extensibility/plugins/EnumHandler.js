import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { jsonataWrapper } from '../jsonataWrapper';
import { useVariables } from '../helpers';

export function EnumHandler({
  schema,
  storeKeys,
  currentPluginIndex,
  rootRule,
  value,
  resource,
  ...props
}) {
  const { itemVars } = useVariables();

  const rule = schema.get('schemaRule');

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const schemaEnum = schema.get('enum');

  let newSchema = schema;

  if (typeof schemaEnum === 'string') {
    const newEnum = jsonataWrapper(schemaEnum).evaluate(
      resource,
      itemVars(resource, rule.itemVars, storeKeys),
    );
    newSchema = schema.set('enum', newEnum);
  }

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={newSchema}
      storeKeys={storeKeys}
      value={value}
      resource={resource}
    />
  );
}
