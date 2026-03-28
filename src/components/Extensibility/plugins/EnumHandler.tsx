import { useEffect, useState } from 'react';
import {
  ComponentPluginType,
  getNextPlugin,
} from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { WidgetProps, WidgetsBindingFactory } from '@ui-schema/ui-schema';
import { Resource } from '../contexts/DataSources';

type EnumHandlerProps = {
  currentPluginIndex: number;
  value: any;
  resource: Resource;
} & WidgetProps;

export function EnumHandler({
  schema,
  storeKeys,
  currentPluginIndex,
  value,
  resource,
  ...props
}: EnumHandlerProps) {
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(
    nextPluginIndex,
    props.widgets,
  ) as ComponentPluginType<Record<string, any>, WidgetsBindingFactory>;

  const schemaEnum = schema.get('enum');

  const [newSchema, setNewSchema] = useState(schema);

  useEffect(() => {
    if (typeof schemaEnum === 'string') {
      jsonata(
        schemaEnum,
        itemVars(resource, rule?.itemVars, storeKeys),
        [],
      ).then(([newEnum]) => {
        setNewSchema(schema.set('enum', newEnum));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaEnum, resource, rule?.itemVars, storeKeys]);

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={newSchema}
      storeKeys={storeKeys}
      value={value}
      resource={resource}
    />
  );
}
