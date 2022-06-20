import React from 'react';
import { uniq } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

export function SchemaRulesInjector({
  schema,
  storeKeys,
  currentPluginIndex,
  schemaRules,
  ...props
}) {
  const visiblePaths = [
    '',
    ...uniq(
      schemaRules.flatMap(entry =>
        entry.path.split(/\./).reduce((acc, step) => {
          if (!acc.length) {
            return [step, step.replace('[]', '')];
          } else {
            return [
              ...acc,
              `${acc[acc.length - 1]}.${step}`,
              `${acc[acc.length - 1]}.${step.replace('[]', '')}`,
            ];
          }
        }, []),
      ),
    ),
  ];

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const path = storeKeys
    .map(item => (typeof item === 'number' ? '[]' : item))
    .join('.')
    .replace('.[]', '[]');

  let newSchema;
  if (!visiblePaths.includes(path)) {
    newSchema = schema.mergeDeep({ widget: 'Null' });
  } else {
    const itemMap = schemaRules.find(item => item.path === path) ?? {};
    newSchema = schema.mergeDeep(itemMap);
  }

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={newSchema}
      storeKeys={storeKeys}
    />
  );
}
