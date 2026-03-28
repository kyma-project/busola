import { last } from 'lodash';
import {
  ComponentPluginType,
  getNextPlugin,
} from '@ui-schema/ui-schema/PluginStack';
import { List, fromJS } from 'immutable';
import {
  StoreSchemaType,
  WidgetProps,
  WidgetsBindingFactory,
} from '@ui-schema/ui-schema';

// fake an OrderedMap-like structure using List to allow for duplicate keys
const propertiesWrapper = (src: [string, any][]) => ({
  map: (cb: (val: any, key: string) => any) =>
    List(src?.map(([key, val]) => cb(val, key))),
  toJSON: () => src,
});

type SchemaRulesInjectorProps = {
  currentPluginIndex: number;
  rootRule: Record<string, any>;
  value: any;
  resource: Record<string, any>;
} & WidgetProps;

export function SchemaRulesInjector({
  schema,
  currentPluginIndex,
  rootRule,
  value,
  resource,
  ...props
}: SchemaRulesInjectorProps) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(
    nextPluginIndex,
    props.widgets,
  ) as ComponentPluginType<Record<string, any>, WidgetsBindingFactory>;

  const { children: childRules, ...itemRule } =
    schema.get('schemaRule') ?? rootRule;

  let newSchema: StoreSchemaType = schema.mergeDeep(itemRule);

  if (schema.get('items')) {
    const newItems = schema.get('items').set('schemaRule', childRules[0]);
    newSchema = newSchema.set('items', newItems);
  }

  if (newSchema.get('properties')) {
    const newProperties = childRules
      ?.map((rule: Record<string, any>) => {
        if (rule.custom) {
          return ['', fromJS({ ...rule, schemaRule: rule })];
        }

        const propertyKey = last(rule.path);
        const property = fromJS(newSchema.get('properties'))
          ?.get(propertyKey)
          ?.set('schemaRule', rule);

        return property ? [propertyKey, property] : null;
      })
      .filter((rule: [string, any] | null) => !!rule);

    newSchema = newSchema.set('properties', propertiesWrapper(newProperties));
  }

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={newSchema}
      value={value}
      resource={resource}
    />
  );
}
