import React, { useMemo } from 'react';
// import { mapValues } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { useTrigger, useSubscription } from '../hooks/useTriggers';
import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function TriggerHandler({
  currentPluginIndex,
  schema,
  required,
  storeKeys,
  onChange,
  resource,
  ...props
}) {
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });
  const rule = schema.get('schemaRule');

  const trigger = useTrigger();

  const subscriptions = Object.entries(schema.get('subscribe') ?? {}).map(
    ([name, formula]) => {
      const modifiers = name.split(/\./);
      const id = modifiers.pop();
      const callback = () => {
        const [value] = jsonata(formula, {
          resource,
          ...itemVars(resource, rule.itemVars, storeKeys),
        });
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      };

      return [
        id,
        {
          modifiers,
          storeKeys,
          callback,
        },
      ];
    },
  );

  useSubscription(Object.fromEntries(subscriptions));

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const myChange = useMemo(
    () => action => {
      if (action.scopes?.includes('value')) {
        action.schema.get('trigger')?.forEach(t => trigger(t, storeKeys));
      }
      onChange(action);
    },
    [onChange, trigger, storeKeys],
  );

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      onChange={myChange}
      schema={schema}
      storeKeys={storeKeys}
      required={required}
      resource={resource}
    />
  );
}
