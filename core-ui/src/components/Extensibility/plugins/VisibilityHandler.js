import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

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
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

  // rule.visibility won't work for "var", we must use schema.get('visibility')
  const visibilityFormula = schema.get('visibility');
  const overwrite = schema.get('overwrite') ?? true;

  if (visibilityFormula) {
    const [visible] = jsonata(
      visibilityFormula,
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
