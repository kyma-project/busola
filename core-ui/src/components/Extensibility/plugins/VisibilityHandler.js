import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { useVariables } from '../hooks/useVariables';

export function VisibilityHandler({
  schema,
  storeKeys,
  currentPluginIndex,
  rootRule,
  resource,
  ...props
}) {
  const { itemVars } = useVariables();

  const rule = schema.get('schemaRule');

  if (rule?.visibility) {
    const visible = jsonataWrapper(rule.visibility).evaluate(
      resource,
      itemVars(resource, rule.itemVars, storeKeys),
    );

    if (!visible) return null;
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
    />
  );
}
