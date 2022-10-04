import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { List } from 'immutable';
import * as jp from 'jsonpath';

import { useVariables } from '../hooks/useVariables';

export function CustomFieldInjector({
  schema,
  storeKeys,
  currentPluginIndex,
  rootRule,
  value,
  resource,
  ...props
}) {
  const { vars, setVar } = useVariables();

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const { path } = schema.get('schemaRule') || {};

  if (path || !storeKeys.size) {
    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
        schema={schema}
        storeKeys={storeKeys}
        value={value}
        resource={resource}
      />
    );
  }

  const varName = schema.get('var');

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
        value={jp.value(vars, varPath)}
        onChange={e => setVar(varPath, e.data.value)}
        storeKeys={List([])}
      />
    );
  } else {
    function getValue(storeKeys, resource) {
      let value = resource;
      const keys = storeKeys.toJS();
      keys.filter(key => key !== '').forEach(key => (value = value?.[key]));
      return value;
    }

    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
        schema={schema}
        onChange={() => {}}
        value={getValue(storeKeys, resource)}
        storeKeys={storeKeys}
        resource={resource}
      />
    );
  }
}
