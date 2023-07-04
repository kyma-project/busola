import React, { Fragment } from 'react';

export function CustomComponent({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
  editMode,
}) {
  const {
    componentName,
    componentType = 'custom',
    ...customProps
  } = schema.get('customProps');
  const arrayProps = schema.get('arrayProps') || {};
  const componentNameWithPrefix = `webcomponent-${componentName}`;
  console.log('lololo props', componentName, componentType, customProps);

  function changeObjectIntoArray(object) {
    return Object.keys(object).map(key => ({ [key]: object[key] }));
  }
  console.log('lololo componentName', componentName);
  let ui5Components;
  if (componentType === 'ui5') {
    ui5Components = require(`/node_modules/@ui5/webcomponents-react/dist/webComponents/${componentName}/index.js`);
    console.log('lolo  sth', ui5Components);
  }
  // else if (componentType === 'custom') {
  //   const DynamicComponentClass = require(`/custom-components/${componentName}`).default;
  //   if (!customElements.get(componentNameWithPrefix)) {
  //     customElements.define(componentNameWithPrefix, DynamicComponentClass);
  //   }
  //   console.log('dynamic-component', componentNameWithPrefix, DynamicComponentClass);

  // }
  else {
    return <>ERROR</>;
  }
  // const DynamicComponent = lazy(() => import(`@ui5/webcomponents-react`));
  // console.log('lolo  DynamicComponent', DynamicComponent);

  if (ui5Components && ui5Components[componentName]) {
    return React.createElement(
      Fragment,
      null,
      React.createElement(
        ui5Components[componentName],
        ...changeObjectIntoArray(
          {
            key: componentName,
            ...customProps,
          } || {},
        ),
      ),
    );
  }
}
