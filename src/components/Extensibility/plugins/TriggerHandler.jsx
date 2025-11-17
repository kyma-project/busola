import { useCallback, useContext, useEffect, useMemo } from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { TriggerContext } from '../contexts/Trigger';

const getSubscriptions = (
  schema,
  jsonata,
  resource,
  itemVars,
  rule,
  storeKeys,
  onChange,
  required,
  triggers,
) => {
  const subsFromSchema = Object.entries(schema.get('subscribe') ?? {});
  if (!subsFromSchema.length) return;
  Promise.all(
    Object.entries(schema.get('subscribe') ?? {}).map(
      async ([name, formula]) => {
        const [value] = await jsonata(formula, {
          resource,
          ...itemVars(resource, rule?.itemVars, storeKeys),
        });
        return [name, value];
      },
    ),
  ).then((result) => {
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
    //setSubscriptions(subs);
    const subsObject = Object.fromEntries(subs);
    triggers.subscribe({ current: subsObject });
  });
};

export function TriggerHandler({
  currentPluginIndex,
  schema,
  required,
  storeKeys,
  onChange,
  resource,
  value,
  ...props
}) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);
  const { itemVars } = useVariables();
  const stableJsonataDeps = useMemo(
    () => ({
      resource,
    }),
    [resource],
  );
  const jsonata = useJsonata(stableJsonataDeps);
  const rule = schema.get('schemaRule');
  const triggers = useContext(TriggerContext);

  useEffect(() => {
    getSubscriptions(
      schema,
      jsonata,
      resource,
      itemVars,
      rule,
      storeKeys,
      onChange,
      required,
      triggers,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableJsonataDeps, required, rule?.itemVars, storeKeys, itemVars]);

  const myChange = useCallback(
    (action) => {
      if (action.scopes?.includes('value')) {
        action.schema
          .get('trigger')
          ?.forEach((t) => triggers.trigger(t, storeKeys));
      }
      onChange(action);
    },
    [onChange, triggers, storeKeys],
  );

  return (
    <Plugin
      {...props}
      value={value}
      currentPluginIndex={nextPluginIndex}
      onChange={myChange}
      schema={schema}
      storeKeys={storeKeys}
      required={required}
      resource={resource}
    />
  );
}
