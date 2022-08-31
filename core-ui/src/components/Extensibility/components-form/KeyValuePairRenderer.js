import React from 'react';

import { KeyValueField, MultiInput } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { getObjectValueWorkaround } from 'components/Extensibility/helpers';
import * as Inputs from 'shared/ResourceForm/inputs';

const availableValueFields = {
  text: Inputs.Text,
  number: Inputs.Number,
};

const getValueComponent = schema => {
  const valueFieldType = schema.get('valueType');
  const valueField = availableValueFields[valueFieldType] || undefined;
  return valueField;
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

  const { tFromStoreKeys } = useGetTranslation();
  const { t } = useTranslation();

  let titleTranslation = '';
  const path = storeKeys.toArray().join('.');
  const schemaRequired = schema.get('required');

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

  const setValue = value => {
    onChange({
      storeKeys,
      scopes: ['value'],
      type: 'set',
      schema,
      required,
      data: { value: createOrderedMap(value) },
    });
  };

  return (
    <KeyValueField
      value={value}
      setValue={setValue}
      input={getValueComponent(schema)}
      title={titleTranslation}
      required={schemaRequired ?? required}
    />
  );
}
