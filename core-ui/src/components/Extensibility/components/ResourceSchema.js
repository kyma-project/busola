import React, { useState, useCallback, useEffect } from 'react';
import { isEmpty } from 'lodash';
import * as jp from 'jsonpath';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import {
  UIStoreProvider,
  createStore,
  storeUpdater,
} from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import { ResourceForm } from 'shared/ResourceForm';
import { KeyValueField } from 'shared/ResourceForm/fields';
import * as Inputs from 'shared/ResourceForm/inputs';

import { FormContainer } from '../ds/FormContainer';
import formWidgets from '../ds/widgets-form';

const FormStack = injectPluginStack(FormContainer);

// TODO left only for reference - remove as soon as all corresponding widgets are implemented
const JSONSchemaForm = ({ properties, path, ...props }) => {
  const { resource, setResource } = props;

  const getValue = path => {
    return jp.value(resource, '$.' + path);
  };

  const keys = Object.keys(properties);
  return keys?.map(key => {
    const newPath = path ? `${path}.${key}` : key;
    if (properties[key].type === 'object') {
      if (!isEmpty(properties[key].properties)) {
        return (
          <ResourceForm.CollapsibleSection simple title={key}>
            <JSONSchemaForm
              properties={properties[key].properties}
              path={newPath}
              {...props}
            />
          </ResourceForm.CollapsibleSection>
        );
      } else if (properties[key].additionalProperties) {
        return (
          <KeyValueField
            value={getValue(newPath)}
            setValue={value => setResource(newPath, value)}
            title={key}
          />
        );
      } else {
        return <div>{key} - Monaco editor here?</div>;
      }
    } else if (properties[key].type === 'string') {
      if (properties[key].enum?.length) {
        const options = properties[key].enum.map(e => ({
          key: e,
          text: e,
        }));
        return (
          <ResourceForm.FormField
            options={options}
            value={getValue(newPath)}
            setValue={value => setResource(newPath, value)}
            label={key}
            input={Inputs.Dropdown}
          />
        );
      } else {
        return (
          <ResourceForm.FormField
            value={getValue(newPath)}
            setValue={value => setResource(newPath, value)}
            label={key}
            input={Inputs.Text}
          />
        );
      }
    } else {
      return <div>{key} - default</div>;
    }
  });
};

export const ResourceSchema = ({
  resource,
  setResource,
  schema,
  translations,
}) => {
  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(resource)),
  );
  const onChange = useCallback(
    actions => {
      setStore(prevStore => storeUpdater(actions)(prevStore));
    },
    [setStore],
  );
  useEffect(() => {
    setResource(store.valuesToJS());
  }, [store.values]);

  const language = useTranslation().i18n.language;
  i18next.removeResourceBundle(language, 'extensibility');
  i18next.addResourceBundle(
    language,
    'extensibility',
    translations?.[language],
  );
  const { t } = useTranslation(['extensibility']);

  if (isEmpty(schema)) return null;
  const schemaMap = createOrderedMap(schema);

  return (
    <UIMetaProvider widgets={formWidgets} t={t}>
      <UIStoreProvider store={store} showValidity={true} onChange={onChange}>
        <FormStack isRoot schema={schemaMap} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
};
