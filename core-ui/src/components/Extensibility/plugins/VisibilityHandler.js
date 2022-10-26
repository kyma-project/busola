import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { useVariables } from '../hooks/useVariables';

export function VisibilityHandler({
  value,
  schema,
  storeKeys,
  currentPluginIndex,
  resource,
  onChange,
  required,
  ...props
}) {
  const { itemVars } = useVariables();

  const rule = schema.get('schemaRule');

  // rule.visibility won't work for "var", we must use schema.get('visibility')
  const visibilityFormula = schema.get('visibility');
  const overwrite =
    typeof schema.get('overwrite') !== 'undefined'
      ? schema.get('overwrite')
      : true;

  if (visibilityFormula) {
    const visible = jsonataWrapper(visibilityFormula).evaluate(
      resource,
      itemVars(resource, rule.itemVars, storeKeys),
    );

    if (!visible) {
      if (value && overwrite) {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: {},
        });
      }
      return null;
    }
  }

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={schema}
      storeKeys={storeKeys}
      resource={resource}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}
