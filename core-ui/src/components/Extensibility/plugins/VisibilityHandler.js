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

  if (rule?.visibility) {
    const visible = jsonataWrapper(rule.visibility).evaluate(
      resource,
      itemVars(resource, rule.itemVars, storeKeys),
    );

    if (!visible) {
      if (value) {
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
