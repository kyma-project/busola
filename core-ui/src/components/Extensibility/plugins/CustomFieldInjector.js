import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { fromJS } from 'immutable';
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
  // console.log('CustomFieldInjector', storeKeys.toJS(), storeKeys.join('.'));
  console.log('CustomFieldInjector', storeKeys.toJS());

  const { vars, setVar } = useVariables();

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const { name, path, var: ruleVar } = schema.get('schemaRule') || {};
  console.log('path', path?.join('.'));
  console.log('var', schema.get('var'), ruleVar);

  if (path || !storeKeys.join('.') || storeKeys.join('.') === '.') {
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

  // console.log('props', props);

  const varName = schema.get('var');
  console.log('NO PATH', name, schema.get('schemaRule'));

  if (varName) {
    const varSuffix = storeKeys
      .filter(item => typeof item === 'number')
      .map(item => `[${item}]`)
      .join('');
    const varPath = `$.${varName}${varSuffix}`;
    console.log('is a var', varPath);

    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
        schema={schema}
        value={jp.value(vars, varPath)}
        onChange={e => setVar(varPath, e.data.value)}
        storeKeys={fromJS([schema.get('var')])}
      />
    );
  } else {
    console.log('FALLBACK');
    return (
      // <Plugin
      // {...props}
      // currentPluginIndex={nextPluginIndex}
      // schema={schema}
      // onChange={() => {}}
      // // storeKeys={fromJS([schema.get('var'), Math.random(1000)])}
      // storeKeys={fromJS([schema.get('var')])}
      // />
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
}
