import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function EnumHandler({
  schema,
  storeKeys,
  currentPluginIndex,
  value,
  resource,
  ...props
}) {
  console.group('EnumHandler');
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const schemaEnum = schema.get('enum');

  let newSchema = schema;

  if (typeof schemaEnum === 'string') {
    const [newEnum] = jsonata(
      schemaEnum,
      itemVars(resource, rule.itemVars, storeKeys),
      [],
    );
    newSchema = schema.set('enum', newEnum);
  }

  console.groupEnd();
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
