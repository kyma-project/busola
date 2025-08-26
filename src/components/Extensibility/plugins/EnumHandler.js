import { useEffect, useState } from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function EnumHandler({
  schema,
  storeKeys,
  currentPluginIndex,
  value,
  resource,
  ...props
}) {
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const schemaEnum = schema.get('enum');

  const [newSchema, setNewSchema] = useState(schema);

  useEffect(() => {
    if (typeof schemaEnum === 'string') {
      jsonata(
        schemaEnum,
        itemVars(resource, rule.itemVars, storeKeys),
        [],
      ).then(([newEnum]) => {
        setNewSchema(schema.set('enum', newEnum));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaEnum, resource, rule.itemVars, storeKeys]);

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
