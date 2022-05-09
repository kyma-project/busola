import React, { useState, useCallback } from 'react';
import { isEmpty } from 'lodash';
import * as jp from 'jsonpath';

import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider, useUIMeta } from '@ui-schema/ui-schema/UIMeta';
import {
  UIStoreProvider,
  createEmptyStore,
  createStore,
  storeUpdater,
} from '@ui-schema/ui-schema';
import { WidgetRenderer } from '@ui-schema/ui-schema/WidgetRenderer';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import { ResourceForm } from 'shared/ResourceForm';
import { KeyValueField } from 'shared/ResourceForm/fields';
import * as Inputs from 'shared/ResourceForm/inputs';

export function StringRenderer({ value }) {
  return <div>[[{value}]]</div>;
}

const widgets = {
  // ErrorFallback: ErrorFallback,
  RootRenderer: ({ children }) => <div>{children}</div>,
  GroupRenderer: ({ children }) => <div>{children}</div>,
  WidgetRenderer,
  pluginStack: [],
  pluginSimpleStack: [],
  types: {
    string: StringRenderer,
    boolean: StringRenderer,
    number: StringRenderer,
    integer: StringRenderer,
  },
  custom: {
    /*
    Accordions: AccordionsRenderer,
    */
    Text: ({ onChangeeee, onKeyDown, value, schema, storeKeys, required }) => {
      console.log('Text', { schema, value, onChangeeee });
      return (
        <input
          onKeyDown={onKeyDown}
          onChange={e => {
            const newVal = e.target.value;

            onChangeeee({
              storeKeys,
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: { value: newVal },
            });
          }}
          value={value}
        />
      );
    },
    /*
    Text: TextRenderer,
    StringIcon: StringIconRenderer,
    TextIcon: TextIconRenderer,
    NumberIcon: NumberIconRenderer,
    NumberSlider,
    SimpleList,
    GenericList,
    OptionsCheck,
    OptionsRadio,
    Select,
    SelectMulti,
    Card: CardRenderer,
    LabelBox,
    FormGroup,
    */
  },
};

export function FormContainer({ children }) {
  // return <Grid container spacing={spacing}>{children}</Grid>;
  return <div container>{children}</div>;
}

const FormStack = injectPluginStack(FormContainer);

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

export const ResourceSchema = ({ ...props }) => {
  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(props.resource)),
  );
  // const [store, setStore] = useState(() => createStore(createOrderedMap(value)));
  const onChange = useCallback(
    actions => {
      setStore(prevStore => {
        console.log('onChange', actions);
        return storeUpdater(actions)(prevStore);
      });
    },
    [setStore],
  );

  if (isEmpty(props.schema)) return null;

  console.log(props.schema);
  const schema = createOrderedMap(props.schema);
  // const schema = createOrderedMap({
  // "type": "object",
  // "properties": {
  // "metadata.name": {
  // "type": "string",
  // "minLength": 3
  // },
  // "comment": {
  // "type": "string",
  // "widget": "Text",
  // "view": {
  // "rows": 3
  // }
  // },
  // // "accept_privacy": {
  // // "type": "boolean"
  // // }
  // },
  // // "required": [
  // // "accept_privacy"
  // // ]
  // });

  return (
    <>
      <div>{JSON.stringify(store)}</div>
      <UIMetaProvider widgets={widgets}>
        <UIStoreProvider
          store={store}
          onChangeeee={onChange}
          showValidity={true}
        >
          <FormStack isRoot schema={schema} />
        </UIStoreProvider>
      </UIMetaProvider>
    </>
  );

  // return <JSONSchemaForm properties={props.schema.properties} {...props} />;
};
