import { useEffect, useMemo, useState } from 'react';
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
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    Promise.all(
      Object.entries(schema.get('subscribe') ?? {}).map(
        async ([name, formula]) => {
          const [value] = await jsonata(formula, {
            resource,
            ...itemVars(resource, rule.itemVars, storeKeys),
          });
          return [name, value];
        },
      ),
    ).then(result => {
      const subs = result.map(([name, value]) => {
        const modifiers = name.split(/\./);
        const id = modifiers.pop();
        const callback = () => {
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
      });
      setSubscriptions(subs);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

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
