import { useCallback, useContext, useEffect } from 'react';
import {
  ComponentPluginType,
  getNextPlugin,
} from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { JsonataFunction, useJsonata } from '../hooks/useJsonata';
import { TriggerContext } from '../contexts/Trigger';
import {
  StoreKeys,
  StoreSchemaType,
  WidgetProps,
  WidgetsBindingFactory,
} from '@ui-schema/ui-schema';
import { Resource } from '../contexts/DataSources';

const getSubscriptions = (
  schema: StoreSchemaType,
  jsonata: JsonataFunction,
  resource: Resource,
  itemVars: (resource: any, names: any, storeKeys: any) => any,
  rule: Record<string, any> | undefined,
  storeKeys: StoreKeys,
  onChange: (action: Record<string, any>) => void,
  required: boolean,
  triggers: {
    trigger: (name: string, storeKeys: StoreKeys) => void;
    subscribe: (sub: Record<string, any>) => void;
    unsubscribe: (sub: Record<string, any>) => void;
    disable: () => void;
    enable: () => void;
    enabled: boolean;
    subs: any;
  },
) => {
  const subsFromSchema = Object.entries(schema.get('subscribe') ?? {});
  if (!subsFromSchema.length) return;
  Promise.all(
    Object.entries(schema.get('subscribe') ?? {}).map(
      async ([name, formula]: [string, any]) => {
        const [value] = await jsonata(formula, {
          resource,
          ...itemVars(resource, rule?.itemVars, storeKeys),
        });
        return [name, value];
      },
    ),
  ).then((result) => {
    const subs = result.map(([name, value]) => {
      const modifiers = name?.split(/\./);
      const id = modifiers?.pop();
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
    const subsObject = Object.fromEntries(subs);
    triggers.subscribe({ current: subsObject });
  });
};

type TriggerHandlerProps = {
  currentPluginIndex: number;
  onChange: (action: Record<string, any>) => void;
  resource: Resource;
  value: any;
} & WidgetProps;

export function TriggerHandler({
  currentPluginIndex,
  schema,
  required,
  storeKeys,
  onChange,
  resource,
  value,
  ...props
}: TriggerHandlerProps) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(
    nextPluginIndex,
    props.widgets,
  ) as ComponentPluginType<Record<string, any>, WidgetsBindingFactory>;
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });
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
  }, [resource, required, rule?.itemVars, storeKeys, itemVars]);

  const myChange = useCallback(
    (action: Record<string, any>) => {
      if (action.scopes?.includes('value')) {
        action.schema
          .get('trigger')
          ?.forEach((t: string) => triggers.trigger(t, storeKeys));
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
