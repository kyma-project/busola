import {
  ComponentPluginType,
  getNextPlugin,
} from '@ui-schema/ui-schema/PluginStack';
import jp from 'jsonpath';

import { useVariables } from '../hooks/useVariables';
import {
  StoreKeys,
  WidgetProps,
  WidgetsBindingFactory,
} from '@ui-schema/ui-schema';

type CustomFieldInjectorProps = {
  currentPluginIndex: number;
  value: any;
  resource: Record<string, any>;
} & WidgetProps;

export function CustomFieldInjector({
  schema,
  storeKeys,
  currentPluginIndex,
  value,
  resource,
  ...props
}: CustomFieldInjectorProps) {
  const { vars, setVar } = useVariables();

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(
    nextPluginIndex,
    props.widgets,
  ) as ComponentPluginType<Record<string, any>, WidgetsBindingFactory>;

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
      .filter((item) => typeof item === 'number')
      .map((item) => `[${item}]`)
      .join('');
    const varPath = `$.${varName}${varSuffix}`;

    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
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
      keys.filter((key) => key !== '').forEach((key) => (value = value?.[key]));
      return value;
    }

    return (
      <Plugin
        {...props}
        currentPluginIndex={nextPluginIndex}
        schema={schema}
        value={getValue(storeKeys, resource)}
        storeKeys={storeKeys}
        resource={resource}
      />
    );
  }
}
