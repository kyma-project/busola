import React, { lazy, Suspense } from 'react';
import { List } from 'immutable';
import * as jp from 'jsonpath';

import { K8sNameField } from 'shared/ResourceForm/fields';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { getPropsFromSchema } from 'components/Extensibility/helpers';
import {
  Icon,
  Input,
  ComboBox,
  ComboBoxItem,
  Select,
  Option,
} from '@ui5/webcomponents-react';
import {
  Resource,
  DataSourcesContextType,
  DataSourcesContext,
} from '../contexts/DataSources';

export function CustomComponent({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
  editMode,
}) {
  const componentName = schema.get('componentName');
  const customProps = schema.get('customProps');

  function changeObjectIntoArray(object) {
    return Object.keys(object).map(key => ({ [key]: object[key] }));
  }

  const DynamicComponentClass = require(`../../../custom-components/${componentName}`)
    .default;
  console.log('dynamic-component', componentName, DynamicComponentClass);

  if (!customElements.get(componentName)) {
    customElements.define(componentName, DynamicComponentClass);
  }

  return React.createElement(
    componentName,
    ...changeObjectIntoArray(customProps || {}),
  );
}
