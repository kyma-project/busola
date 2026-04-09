import jp from 'jsonpath';

import { useVariables } from '../hooks/useVariables';
import { WidgetPluginProps } from '@ui-schema/react';
import { StoreKeys } from '@ui-schema/ui-schema';

type CustomFieldInjectorProps = {
  value: any;
  resource: Record<string, any>;
} & WidgetPluginProps;

export function CustomFieldInjector({
  schema,
  storeKeys,
  Next,
  value,
  resource,
  ...props
}: CustomFieldInjectorProps) {
  const { vars, setVar } = useVariables();

  const { path } = schema.get('schemaRule') || {};

  if (path || !storeKeys.size) {
    return (
      <Next.Component
        {...props}
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
      .filter((item: string | number) => typeof item === 'number')
      .map((item: string | number) => `[${item}]`)
      .join('');
    const varPath = `$.${varName}${varSuffix}`;

    return (
      <Next.Component
        {...props}
        schema={schema}
        value={jp.value(vars, varPath)}
        onChange={(e: Record<string, any>) => setVar(varPath, e.data.value)}
        storeKeys={storeKeys.set(-1, `$${varName}`)}
      />
    );
  } else {
    function getValue(storeKeys: StoreKeys, resource: Record<string, any>) {
      let value = resource;
      const keys = storeKeys.toJS();
      keys
        .filter((key: string | number) => key !== '')
        .forEach(
          (key: string | number) =>
            (value = value?.[key as keyof typeof value]),
        );
      return value;
    }

    return (
      <Next.Component
        {...props}
        schema={schema}
        value={getValue(storeKeys, resource)}
        storeKeys={storeKeys}
        resource={resource}
      />
    );
  }
}
