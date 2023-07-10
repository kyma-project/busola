import React, { Fragment } from 'react';
import { useJsonata } from '../hooks/useJsonata';
import { useVariables } from '../hooks/useVariables';

export function CustomComponent({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
  editMode,
}) {
  const { itemVars } = useVariables();

  const rule = schema.get('schemaRule');
  const item = itemVars(resource, rule.itemVars, storeKeys);
  const {
    componentName,
    componentType = 'custom',
    ...customProps
  } = schema.get('customProps');
  const arrayProps = schema.get('arrayProps');
  const componentNameWithPrefix = `webcomponent-${componentName}`;

  const jsonata = useJsonata({
    resource,
    scope: value,
    value,
  });

  function makeJsonata(propObject, item) {
    const [value, error] = jsonata(propObject, item);
    if (error) {
      console.warn('Widget::CustomComponent error:', error);
      return propObject;
    } else {
      return value;
    }
  }
  function changeObjectOfArraysIntoArray(object) {
    let newProps = {};
    let longestArrayLength = 0;
    Object.keys(object).forEach(key => {
      newProps[key] = makeJsonata(object[key], item);
      if (
        Array.isArray(newProps[key]) &&
        newProps[key].length > longestArrayLength
      ) {
        longestArrayLength = newProps[key].length;
      }
    });

    const finalResult = [];
    for (let i = 0; i < longestArrayLength; i++) {
      const result = {};

      const allKeys = Object.keys(object);
      allKeys.forEach(key => {
        if (newProps[key] && newProps[key][i]) {
          result[key] = Array.isArray(newProps[key])
            ? newProps[key][i]
            : newProps[key];
        }
      });
      finalResult.push(result);
    }
    return finalResult;
  }
  let mergedArrays = [];
  if (arrayProps) {
    mergedArrays = changeObjectOfArraysIntoArray(arrayProps);
  }

  let ui5Components, DynamicComponentClass;
  if (componentType === 'ui5') {
    ui5Components = require(`/node_modules/@ui5/webcomponents-react/dist/webComponents/${componentName}/index.js`);
  } else if (componentType === 'custom') {
    DynamicComponentClass = require(`/custom-components/${componentName}`)
      .default;
    if (!customElements.get(componentNameWithPrefix)) {
      customElements.define(componentNameWithPrefix, DynamicComponentClass);
    }
  } else {
    return <>ERROR</>;
  }

  if (ui5Components && ui5Components[componentName]) {
    return React.createElement(
      Fragment,
      null,
      arrayProps
        ? mergedArrays.map((entryProps, index) => {
            return React.createElement(
              ui5Components[componentName],
              {
                key: `${componentName}-${index}`,
                ...customProps,
                ...entryProps,
                onChange: e => {
                  onChange({
                    storeKeys,
                    scopes: ['value'],
                    type: 'set',
                    schema,
                    required,
                    data: { value: e.target.text },
                  });
                },
              } || {},
            );
          })
        : React.createElement(
            ui5Components[componentName],
            {
              key: componentName,
              ...customProps,
              onChange: e => {
                onChange({
                  storeKeys,
                  scopes: ['value'],
                  type: 'set',
                  schema,
                  required,
                  data: { value: e.target.text },
                });
              },
            } || {},
          ),
    );
  } else if (DynamicComponentClass) {
    return React.createElement(
      componentNameWithPrefix,
      {
        key: componentName,
        ...customProps,
      } || {},
    );
  }
}
