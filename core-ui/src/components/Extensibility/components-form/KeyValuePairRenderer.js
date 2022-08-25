import React from 'react';
import { memo } from '@ui-schema/ui-schema';
import { extractValue } from '@ui-schema/ui-schema/UIStore';

import { KeyValueField } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { getObjectValueWorkaround } from 'components/Extensibility/helpers';

function KeyValuePairRendererCore({
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

  if (tFromStoreKeys(storeKeys, schema) !== path)
    titleTranslation = tFromStoreKeys(storeKeys, schema);
  else if (path === 'metadata.labels')
    titleTranslation = t('common.headers.labels');
  else if (path === 'metadata.annotations')
    titleTranslation = t('common.headers.annotations');

  return (
    <KeyValueField
      value={value ? value.toJS() : {}}
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
      title={titleTranslation}
      required={required}
    />
  );
}

export const KeyValuePairRenderer = extractValue(
  memo(KeyValuePairRendererCore),
);
