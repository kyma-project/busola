import { last } from 'lodash';
import { List, fromJS } from 'immutable';
import { WidgetPluginProps } from '@ui-schema/react';
import { SomeSchema } from '@ui-schema/ui-schema';

// fake an OrderedMap-like structure using List to allow for duplicate keys
const propertiesWrapper = (src: [string, any][]) => ({
  map: (cb: (val: any, key: string) => any) =>
    List(src?.map(([key, val]) => cb(val, key))),
  toJSON: () => src,
});

type SchemaRulesInjectorProps = {
  rootRule: Record<string, any>;
  value: any;
  resource: Record<string, any>;
} & WidgetPluginProps;

export function SchemaRulesInjector({
  schema,
  Next,
  rootRule,
  value,
  resource,
  ...props
}: SchemaRulesInjectorProps) {
  const { children: childRules, ...itemRule } =
    schema.get('schemaRule') ?? rootRule;

  let newSchema: SomeSchema = schema.mergeDeep(itemRule);

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
    <Next.Component
      {...props}
      schema={newSchema}
      value={value}
      resource={resource}
    />
  );
}
