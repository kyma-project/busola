import React from 'react';

import { KeyValueField } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import {
  getObjectValueWorkaround,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';
import * as Inputs from 'shared/ResourceForm/inputs';
import { Dropdown } from 'shared/ResourceForm/inputs';
import './KeyValuePairRenderer.scss';

const getEnumComponent = (
  enumValues,
  isKeyInput = true,
  input = Inputs.Text,
) => {
  if (!Array.isArray(enumValues)) return input;

  const options = enumValues.map(opt => ({ key: opt, text: opt }));
  return ({ onChange, setValue, onBlur, value, ...props }) => (
    <Dropdown
      {...props}
      value={value}
      options={options}
      setValue={v => {
        isKeyInput
          ? onChange({
              target: {
                value: v,
              },
            })
          : setValue(v);
        onBlur();
      }}
    />
  );
};

const getValueComponent = valueInfo => {
  const { type, keyEnum: valuKeyEnum, valueEnum } = valueInfo || {};

  switch (type) {
    case 'number':
      return getEnumComponent(valueEnum, false, Inputs.Number);
    case 'string':
      return getEnumComponent(valueEnum, false, Inputs.Text);
    case 'object':
      return ({ setValue, value }) => (
        <KeyValueField
          className="nested-key-value-pair"
          value={value}
          setValue={v => {
            setValue(v);
          }}
          input={{
            key: getEnumComponent(valuKeyEnum),
            value: getEnumComponent(valueEnum, false),
          }}
        />
      );
    default:
      return getEnumComponent(valueEnum, false);
  }
};

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  value,
  onChange,
  required,
  resource,
}) {
  // TODO the value obtained by ui-schema is undefined for this component
  value = getObjectValueWorkaround(schema, resource, storeKeys, value);

  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { t } = useTranslation();

  let titleTranslation = '';
  const path = storeKeys.toArray().join('.');
  const valueInfo = schema.get('value') || {};

  if (tFromStoreKeys(storeKeys, schema) !== path)
    titleTranslation = tFromStoreKeys(storeKeys, schema);
  else if (path === 'metadata.labels')
    titleTranslation = t('common.headers.labels');
  else if (path === 'metadata.annotations')
    titleTranslation = t('common.headers.annotations');

  try {
    value = value ? value.toJS() : {};
  } catch (error) {
    value = {};
  }

  return (
    <KeyValueField
      value={value}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value: createOrderedMap(value) },
        });
      }}
      input={{
        value: getValueComponent(valueInfo),
        key: getEnumComponent(schema.get('keyEnum')),
      }}
      className="key-enum"
      title={titleTranslation}
      initialValue={valueInfo.type === 'object' ? {} : ''}
      defaultOpen={schema.get('defaultOpen') ?? true}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
