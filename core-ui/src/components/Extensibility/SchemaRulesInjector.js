import React from 'react';
import { uniq, merge, initial } from 'lodash';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';
import { OrderedMap } from 'immutable';

const byPath = a => b => JSON.stringify(b.path) === JSON.stringify(a);

export function prepareSchemaRules(ruleDefs) {
  const rules = [{ path: [], children: [] }];

  const addRule = rule => {
    rules.push(rule);
    const parentPath = initial(rule.path);
    const lastParent = rules.findLast(byPath(parentPath));
    if (lastParent) {
      lastParent.children.push(rule);
    }
  };

  const extractRules = ({ path, ...ruleDef }, parentPath = []) => {
    console.log('parentPath', parentPath);
    const fullPath = [
      ...parentPath,
      ...(Array.isArray(path) ? path : path.replace(/\[]/g, '.[]').split('.')),
    ];

    initial(fullPath).reduce((acc, step) => {
      const myPath = [...acc, step];
      // const lastRule = rules.findLast(rule => JSON.stringify(rule.path) === JSON.stringify(myPath));
      const lastRule = rules.findLast(byPath(myPath));
      if (!lastRule) {
        addRule({
          path: myPath,
          auto: true,
          children: [],
        });
      }
      return myPath;
    }, []);

    const lastRule = rules.findLast(byPath(fullPath));
    if (!lastRule || !lastRule.auto) {
      addRule({
        ...ruleDef,
        path: fullPath,
        children: [],
      });
    } else {
      merge(lastRule, ruleDef);
      lastRule.auto = false;
      lastRule.children = [];
    }
    ruleDef.children?.forEach(subDef => extractRules(subDef, fullPath));
  };

  ruleDefs.forEach(subDef => extractRules(subDef));

  return rules;
}

export function SchemaRulesInjector({
  schema,
  storeKeys,
  currentPluginIndex,
  schemaRules,
  ...props
}) {
  console.log('SchemaRulesInjector', schemaRules);
  const visiblePaths = schemaRules.map(rule =>
    rule.path.join('.').replace('.[]', ''),
  );
  // const visiblePaths = [
  // '',
  // ...uniq(
  // schemaRules.flatMap(entry =>
  // entry.path.split(/\./).reduce((acc, step) => {
  // const flatStep = step.replace('[]', '');
  // if (!acc.length) {
  // return [flatStep];
  // } else {
  // return [...acc, `${acc[acc.length - 1]}.${flatStep}`];
  // }
  // }, []),
  // ),
  // ),
  // ];
  // console.log('visiblePaths', visiblePaths);

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  const path = storeKeys.map(item => (typeof item === 'number' ? '[]' : item));
  // .join('.')
  // .replace('.[]', '[]');
  // const flatPath = path.replace(/\[]/g, '');
  const flatPath = path
    .join('.')
    .replace('.[]', '[]')
    .replace(/\[]/g, '');

  let newSchema;
  if (!visiblePaths.includes(flatPath)) {
    return null;
  }

  console.log('itemRule?', path.toJS());
  const { simple, advanced, path: myPath, children: childRules, ...itemRule } =
    schemaRules.find(byPath(path)) ?? {};

  console.log('itemRule', { rule: schemaRules.find(byPath(path)), childRules });

  newSchema = schema.mergeDeep(itemRule);

  return (
    <Plugin
      {...props}
      schemaRules={childRules || []}
      currentPluginIndex={nextPluginIndex}
      schema={newSchema}
      storeKeys={storeKeys}
    />
  );
}
