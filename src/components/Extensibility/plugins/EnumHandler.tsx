import { useEffect, useState } from 'react';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { Resource } from '../contexts/DataSources';
import { WidgetPluginProps } from '@ui-schema/react';

type EnumHandlerProps = {
  value: any;
  resource: Resource;
} & WidgetPluginProps;

export function EnumHandler({
  schema,
  storeKeys,
  Next,
  value,
  resource,
  ...props
}: EnumHandlerProps) {
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

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
    <Next.Component
      {...props}
      schema={newSchema}
      storeKeys={storeKeys}
      value={value}
      resource={resource}
    />
  );
}
